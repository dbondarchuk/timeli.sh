import { ScrollArea } from "@timelish/ui";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollArea className="h-[100svh] w-full">{children}</ScrollArea>;
}
