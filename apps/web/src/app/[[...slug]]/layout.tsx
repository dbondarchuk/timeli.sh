import { ConfigProvider, SonnerToaster, Toaster } from "@timelish/ui";

import { Resource } from "@timelish/types";

import NextScript from "next/script";

import { CookiesProvider } from "@/components/cookies-provider";
import { getLoggerFactory } from "@timelish/logger";
import { buildGoogleFontsUrl, getColorsCss } from "@timelish/utils";
import "../globals.css";

import { getServicesContainer } from "@/utils/utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

const ScriptRenderer = ({
  resource,
  id,
}: {
  resource: Resource;
  id: string | number;
}) => {
  switch (resource.source) {
    case "inline":
      return <NextScript id={id.toString()}>{resource.value}</NextScript>;
    case "remote":
      return <NextScript src={resource.url}></NextScript>;
  }
};

const CssRenderer = ({
  resource,
  id,
}: {
  resource: Resource;
  id: string | number;
}) => {
  switch (resource.source) {
    case "inline":
      return <style id={id.toString()}>{resource.value}</style>;
    case "remote":
      // eslint-disable-next-line @next/next/no-css-tags
      return <link rel="stylesheet" href={resource.url} />;
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logger = getLoggerFactory("RootLayout")("RootLayout");
  logger.debug("Starting root layout render");

  const servicesContainer = await getServicesContainer();
  const { general, scripts, styling } =
    await servicesContainer.configurationService.getConfigurations(
      "general",
      "scripts",
      "styling",
    );

  const locale = await getLocale();

  logger.debug(
    { hasGeneral: !!general, hasScripts: !!scripts, hasStyling: !!styling },
    "Retrieved configurations",
  );

  if (!general) {
    logger.debug("No general configuration found, returning minimal layout");
    return (
      <html>
        <body>{children}</body>
      </html>
    );
  }

  const primaryFont = styling?.fonts?.primary || "Montserrat";
  const secondaryFont = styling?.fonts?.secondary || "Playfair Display";
  const tertiaryFont = styling?.fonts?.tertiary;

  const fontsCssUrl = buildGoogleFontsUrl(
    primaryFont,
    secondaryFont,
    tertiaryFont,
  );

  const fontsRes = await fetch(fontsCssUrl, {
    cache: "force-cache",
  });

  const fonts = await fontsRes.text();
  const colors = getColorsCss(styling?.colors);

  logger.debug(
    { fontsLength: fonts.length, hasColors: !!colors },
    "Generated styles",
  );

  return (
    <CookiesProvider>
      <html lang={locale} className="scroll-smooth">
        <head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @layer base {
              ${fonts}

              :root {
                --font-primary: '${primaryFont}';
                --font-secondary: '${secondaryFont}';
                ${tertiaryFont ? `--font-tertiary: '${tertiaryFont}';` : ""}
                ${colors}
              }
            }
          `,
            }}
          />
          {general.favicon && (
            <link
              rel="icon"
              href={general.favicon}
              type="image/x-icon"
              sizes="any"
            />
          )}
          {scripts?.header?.map((resource, index) => (
            <ScriptRenderer resource={resource} id={index} key={index} />
          ))}
          {styling?.css?.map((resource, index) => (
            <CssRenderer resource={resource} id={index} key={index} />
          ))}
        </head>
        {/* <TwLoad /> */}
        <body className="font-primary">
          <ConfigProvider config={general}>
            <NextIntlClientProvider>
              <main className="min-h-screen max-w-none">{children}</main>
              {scripts?.footer?.map((resource, index) => (
                <ScriptRenderer resource={resource} id={index} key={index} />
              ))}
              <Toaster />
              <SonnerToaster />
            </NextIntlClientProvider>
          </ConfigProvider>
        </body>
      </html>
    </CookiesProvider>
  );
}
