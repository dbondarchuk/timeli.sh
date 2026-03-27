import { AuthLayout } from "@/components/admin/auth/layout";
import { UserSignupForm } from "@/components/admin/auth/user-signup-form";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("auth.signUp"),
  };
}

export default async function AuthenticationPage() {
  const logger = getLoggerFactory("AdminPages")("signin");
  const publicDomain = process.env.PUBLIC_DOMAIN!;

  logger.debug("Loading signin page");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  const t = await getI18nAsync("admin");

  logger.debug("Signin page loaded");

  return (
    <AuthLayout
      title={t("auth.signUp")}
      description={t("auth.signUpDescription")}
    >
      <UserSignupForm publicDomain={publicDomain} />
    </AuthLayout>
  );
}
