export const CarddavLogo: React.FC<React.HTMLAttributes<SVGElement>> = (
  props,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={props.className}
  >
    <path
      fill="currentColor"
      d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
    />
    <circle cx="7" cy="9" r="1" fill="currentColor" />
    <circle cx="7" cy="12" r="1" fill="currentColor" />
    <circle cx="7" cy="15" r="1" fill="currentColor" />
  </svg>
);

