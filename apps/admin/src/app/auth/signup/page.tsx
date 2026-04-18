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
    title: t("auth.signUp.title"),
  };
}

export default async function SignupPage() {
  const logger = getLoggerFactory("AdminPages")("signup");
  const publicDomain = process.env.PUBLIC_DOMAIN!;

  logger.debug("Loading signup page");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const u = session.user as { organizationInstalled?: boolean };
    redirect(u.organizationInstalled ? "/dashboard" : "/checkout");
  }

  const t = await getI18nAsync("admin");

  logger.debug("Signup page loaded");

  return (
    <AuthLayout
      title={t("auth.signUp.title")}
      description={t("auth.signUp.description")}
    >
      <UserSignupForm publicDomain={publicDomain} />
    </AuthLayout>
  );
}
