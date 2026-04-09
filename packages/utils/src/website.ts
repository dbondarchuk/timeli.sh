export const getWebsiteUrl = (organizationSlug?: string, domain?: string) => {
  const schema = domain?.startsWith("localhost") ? "http" : "https";
  return domain
    ? `${schema}://${domain}`
    : `${schema}://${organizationSlug}.${process.env.PUBLIC_DOMAIN}`;
};

export const getAdminUrl = () => {
  const schema = process.env.ADMIN_DOMAIN?.startsWith("localhost")
    ? "http"
    : "https";
  return `${schema}://${process.env.ADMIN_DOMAIN}`;
};
