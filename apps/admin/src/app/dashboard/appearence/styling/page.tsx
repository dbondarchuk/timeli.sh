import { redirect } from "next/navigation";

/** Fonts, colors, and CSS are edited on the aggregate site & brand page. */
export default function Page() {
  redirect("/dashboard/settings/brand#settings-styling");
}
