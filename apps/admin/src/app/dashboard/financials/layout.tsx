import { redirectIfFeatureUnavailable } from "@/lib/billing/subscription-feature-guard";

export default async function FinancialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfFeatureUnavailable("financials");
  return children;
}
