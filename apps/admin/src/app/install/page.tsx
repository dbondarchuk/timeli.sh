import { InstallWizard } from "@/components/install/install-wizard";
import { getI18nAsync } from "@timelish/i18n/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getInstallCalendarAppsSnapshot,
  getInstallPaymentAppsSnapshot,
  getInstallPreferencesSnapshot,
  getInstallServicesSnapshot,
  getInstallWorkspaceSnapshot,
} from "../../components/install/actions";
import { getSession } from "../utils";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getI18nAsync("install");
  return {
    title: t("page.title"),
    description: t("page.description"),
  };
};

export default async function InstallPage() {
  const session = await getSession();
  const publicDomain = process.env.PUBLIC_DOMAIN ?? "timeli.sh";

  if (session.user.organizationId && session.user.organizationInstalled) {
    redirect("/dashboard");
  }

  const emailVerified = Boolean(
    (session.user as { emailVerified?: boolean }).emailVerified,
  );

  const [
    workspaceFromServer,
    servicesFromServer,
    calendarAppsFromServer,
    paymentAppsFromServer,
    preferencesFromServer,
  ] = await Promise.all([
    getInstallWorkspaceSnapshot(),
    getInstallServicesSnapshot(),
    getInstallCalendarAppsSnapshot(),
    getInstallPaymentAppsSnapshot(),
    getInstallPreferencesSnapshot(),
  ]);

  return (
    <InstallWizard
      email={session.user.email}
      emailVerified={emailVerified}
      publicDomain={publicDomain}
      workspaceFromServer={workspaceFromServer}
      servicesFromServer={servicesFromServer}
      calendarAppsFromServer={calendarAppsFromServer}
      paymentAppsFromServer={paymentAppsFromServer}
      preferencesFromServer={preferencesFromServer}
    />
  );
}
