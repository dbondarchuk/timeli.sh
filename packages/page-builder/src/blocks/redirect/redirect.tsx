import { permanentRedirect, redirect } from "next/navigation";

export const Redirect = ({
  url,
  permanent,
}: {
  url: string;
  permanent?: boolean;
}) => {
  return permanent ? permanentRedirect(url) : redirect(url);
};
