import { FormModel } from "../../models";
import { FormBlockComponent } from "./component";
import { FormBlockReaderProps } from "./schema";

type FormBlockServerWrapperProps = {
  props: FormBlockReaderProps["props"];
  style: FormBlockReaderProps["style"];
  blockBase?: { className?: string; id?: string };
  appId?: string;
  args?: unknown;
};

export const FormBlockServerWrapper = async ({
  props,
  style,
  blockBase,
  appId,
  args,
}: FormBlockServerWrapperProps) => {
  const formId = props?.formId ?? null;

  if (!appId || !formId) {
    return (
      <FormBlockComponent
        form={null}
        appId={appId ?? ""}
        style={style ?? {}}
        blockBase={blockBase}
        args={args}
      />
    );
  }

  const { headers } = await import("next/headers");
  const { ServicesContainer } = await import("@timelish/services");
  const { FormsRepositoryService } = await import(
    "../../service/repository-service"
  );

  const headersList = await headers();
  const companyId = headersList.get("x-company-id") as string | null;

  if (!companyId) {
    return (
      <FormBlockComponent
        form={null}
        appId={appId}
        style={style ?? {}}
        blockBase={blockBase}
        args={args}
      />
    );
  }

  const appServiceProps =
    ServicesContainer(companyId).connectedAppsService.getAppServiceProps(appId);

  const repositoryService = new FormsRepositoryService(
    appId,
    companyId,
    appServiceProps.getDbConnection,
    appServiceProps.services,
  );

  let form: FormModel | null = null;
  try {
    form = await repositoryService.getFormById(formId);
  } catch {
    form = null;
  }

  if (!form || form.isArchived) {
    return (
      <FormBlockComponent
        form={null}
        appId={appId}
        style={style ?? {}}
        blockBase={blockBase}
        args={args}
      />
    );
  }

  return (
    <FormBlockComponent
      form={form}
      appId={appId}
      style={style ?? {}}
      blockBase={blockBase}
      args={args}
    />
  );
};
