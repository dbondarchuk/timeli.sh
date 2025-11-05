import PageContainer from "@/components/admin/layout/page-container";
import { TemplateTemplates } from "@/components/admin/templates/templates";
import { TemplatesTemplate } from "@/components/admin/templates/templates/type";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { CommunicationChannel } from "@timelish/types";
import { Heading, Skeleton } from "@timelish/ui";
import { Metadata } from "next";
import { Suspense } from "react";
import { TemplateFormPage } from "../../form-page";

type Props = PageProps<"/dashboard/templates/new/[type]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  const { type } = await props.params;
  return {
    title: t("templates.newPage.title", {
      type: t(
        `common.labels.channel.${type as string as CommunicationChannel}`,
      ).toLowerCase(),
    }),
  };
}

export default async function NewTemplatePage({ params, searchParams }: Props) {
  const logger = getLoggerFactory("AdminPages")("new-template");
  const t = await getI18nAsync("admin");
  const { type: typeParam } = await params;
  const type = typeParam as string as CommunicationChannel;
  const { template: templateParam } = await searchParams;
  const templateQuery = templateParam as string;

  logger.debug(
    {
      type,
      template: templateQuery,
    },
    "Loading new template page",
  );

  let template: TemplatesTemplate | undefined = undefined;
  if (templateQuery) {
    template = TemplateTemplates[type][templateQuery];
  }

  logger.debug(
    {
      type,
      template: templateQuery,
      hasTemplate: !!template,
    },
    "New template page loaded",
  );

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4 h-full">
        <div className="flex flex-col gap-4 justify-between">
          <Heading
            title={t("templates.newPage.title", {
              type: t(`common.labels.channel.${type}`).toLowerCase(),
            })}
          />
        </div>
        <Suspense fallback={<Skeleton className="w-full h-full" />}>
          <TemplateFormPage type={type} template={template} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
