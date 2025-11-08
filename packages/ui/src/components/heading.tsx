import React from "react";
import { Link } from "./link";

type HeadingProps = {
  title: string;
  description?: React.ReactNode;
  href?: string;
};

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  href,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">
        {href ? (
          <Link href={href} variant="underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
