import { cn } from "cn";

/**
 * locosheet mark: a sheet grid of modular blocks, with the last cell left
 * as a "+" for whatever you build next. Uses currentColor.
 */
export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-4", className)}
      {...props}
    >
      <g fill="currentColor">
        <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
        <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
        <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" />
      </g>
      <path
        d="M16.5 13.5v6M13.5 16.5h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
