"use server";

export type OrganizationAuthorUser = {
  id: string;
  name: string;
};

export async function getOrganizationAuthorUsers(): Promise<
  OrganizationAuthorUser[]
> {
  const { headers } = await import("next/headers");
  const { ServicesContainer } = await import("@timelish/services");

  const headersList = await headers();
  const organizationId = headersList.get("x-organization-id");
  if (!organizationId) {
    return [];
  }

  const users =
    await ServicesContainer(organizationId).userService.getOrganizationAdminUsers();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
  }));
}
