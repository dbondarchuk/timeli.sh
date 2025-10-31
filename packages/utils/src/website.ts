export const getWebsiteUrl = (companySlug?: string, domain?: string) => {
  return domain
    ? `https://${domain}`
    : `https://${companySlug}.${process.env.PUBLIC_DOMAIN}`;
};

export const getAdminUrl = () => `https://${process.env.ADMIN_DOMAIN}`;
