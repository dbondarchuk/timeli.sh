import {
  ButtonMenuItem,
  LinkMenuItem,
  MenuItem,
  PageHeader,
} from "@vivid/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
  Drawer,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Link,
  Logo,
} from "@vivid/ui";
import { ChevronDown, icons } from "lucide-react";
import React from "react";
import { ReplaceOriginalColors } from "../helpers/replace-original-colors";
import {
  HeaderDrawerHeader,
  HeaderDrawerTrigger,
  PortalDrawerContent,
} from "./drawer-content";
import { HeaderWithScrollShadow } from "./with-scroll-shadow";

export type HeaderProps = {
  name: string;
  logo?: string;
  config: PageHeader;
  className?: string;
};

const LinkRender: React.FC<{
  item: Omit<LinkMenuItem, "url" | "type"> | ButtonMenuItem;
}> = ({ item }) => (
  <>
    {item.prefixIcon && (
      <Icon
        name={item.prefixIcon as keyof typeof icons}
        className="w-6 h-6"
        aria-label={item.label}
      />
    )}
    {item.label}
    {item.suffixIcon && (
      <Icon
        name={item.suffixIcon as keyof typeof icons}
        className="w-6 h-6"
        aria-label={item.label}
      />
    )}
  </>
);

const HeaderBase: React.FC<HeaderProps> = ({
  name,
  logo,
  config,
  className,
}) => {
  const getLink = (item: MenuItem, isSidebar: boolean) => {
    switch (item.type) {
      case "icon":
        return (
          <Link
            href={item.url}
            className={cn("no-underline inline-flex gap-2", item.className)}
            key={item.url}
          >
            <Icon
              name={item.icon as keyof typeof icons}
              className="w-6 h-6"
              aria-label={item.label}
            />
            {isSidebar && <span className="ml-2">{item.label}</span>}
          </Link>
        );

      case "button":
        return (
          <Link
            button
            variant={item.variant}
            size={item.size}
            key={item.url}
            href={item.url}
            font={item.font}
            fontSize={item.fontSize}
            fontWeight={item.fontWeight}
            className={cn("", item.className)}
          >
            <LinkRender item={item} />
          </Link>
        );

      case "link":
      default:
        return (
          <Link
            key={item.url}
            variant={item.variant}
            size={item.size}
            font={item.font}
            fontSize={item.fontSize}
            fontWeight={item.fontWeight}
            className={cn(
              "hover:text-gray-600 transition-colors inline-flex items-center gap-1",
              item.className,
            )}
            href={item.url}
          >
            <LinkRender item={item} />
          </Link>
        );
    }
  };

  return (
    <header
      className={cn(
        "font-light text-[hsl(var(--value-foreground-color))] font-[family-name:--font-primary-value] w-full bg-[hsl(var(--value-background-color))] z-20 transition-all duration-300",
        config?.sticky && "sticky top-0",
        config?.shadow === "static" && "drop-shadow-md",
        className,
      )}
    >
      <ReplaceOriginalColors />
      <div className="container mx-auto flex flex-wrap p-5 flex-row items-center gap-4">
        <Logo name={name} logo={logo} showLogo={config?.showLogo} />
        <div className="hidden ml-auto md:flex flex-wrap gap-2 items-center text-base justify-center">
          <nav className="flex flex-row gap-6 items-center">
            {config?.menu?.map((item, index) => (
              <React.Fragment key={index}>
                {item.type !== "submenu" ? (
                  getLink(item, false)
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex gap-1 items-center group cursor-pointer">
                      <LinkRender item={item} />
                      <ChevronDown
                        size={16}
                        className="group-data-[state=open]:rotate-180 transition-transform"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex flex-col gap-1">
                      {item.children.map((subItem, jndex) => (
                        <DropdownMenuItem
                          key={jndex}
                          asChild
                          className="text-base"
                        >
                          {getLink(subItem, false)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="flex ml-auto md:hidden">
          <Drawer direction="right">
            <HeaderDrawerTrigger />
            <PortalDrawerContent className="bg-background flex flex-col  h-full min-w-[100px] max-w-fit mt-24 fixed bottom-0 right-0 left-auto rounded-none">
              <ReplaceOriginalColors />
              <HeaderDrawerHeader />
              <div className="w-full py-6 px-4">
                <nav className="flex flex-col gap-3 items-end">
                  {config?.menu?.map((item, index) =>
                    item.type !== "submenu" ? (
                      <React.Fragment key={index}>
                        {getLink(item, true)}
                      </React.Fragment>
                    ) : (
                      <Accordion type="single" collapsible key={index}>
                        <AccordionItem value="item-1" className="border-none">
                          <AccordionTrigger>
                            <LinkRender item={item} />
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-2 pl-2">
                            {item.children.map((subItem, jndex) => (
                              <div key={jndex}>{getLink(subItem, true)}</div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ),
                  )}
                </nav>
              </div>
            </PortalDrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};

export const Header: React.FC<HeaderProps> = (props) => {
  const baseHeader = <HeaderBase {...props} />;

  if (props.config?.shadow === "on-scroll") {
    return <HeaderWithScrollShadow>{baseHeader}</HeaderWithScrollShadow>;
  }

  return baseHeader;
};
