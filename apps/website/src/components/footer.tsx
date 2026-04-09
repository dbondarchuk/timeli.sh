import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#integrations" },
    // { name: "API", href: "#" },
  ],
  //   organization: [
  //     { name: "About", href: "#" },
  //     { name: "Blog", href: "#" },
  //     { name: "Careers", href: "#" },
  //     { name: "Contact", href: "#" },
  //   ],
  // resources: [
  //   { name: "Documentation", href: "#" },
  //   { name: "Help Center", href: "#" },
  //   { name: "Community", href: "#" },
  //   { name: "Status", href: "#" },
  // ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    // { name: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
              </div>
              <span className="text-3xl font-bold">
                timeli<span className="text-primary">.sh</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              The all-in-one appointment scheduling platform for modern
              businesses.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <h3 className="text-sm font-semibold text-foreground">Organization</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
          {/* 
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold">
              timeli
              <span className="text-primary">.sh</span>
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
