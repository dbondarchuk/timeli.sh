import { cn } from "../utils";

// function Skeleton({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) {
//   return (
//     <div
//       className={cn("animate-pulse rounded-md bg-muted", className)}
//       {...props}
//     />
//   );
// }

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative rounded-md bg-muted overflow-hidden", className)}
    >
      <div
        style={{
          // @ts-ignore - CSS variables are not typed
          "--shimmer-color": "hsl(from hsl(var(--muted)) h s calc(l + 20))",
        }}
        className={cn(
          "animate-shimmer absolute inset-0 bg-[linear-gradient(90deg,transparent,var(--shimmer-color),transparent)]",
        )}
        {...props}
      />
    </div>
  );
}

export { Skeleton };
