type PublicIconName =
  "home" |
  "user" |
  "user-round" |
  "search" |
  "shopping-cart" |
  "shopping-basket" |
  "dashboard" |
  "mail" |
  "cart" |
  "dollar" |
  "notification" |
  "down" |
  "dot" |
  "right" |
  "left" |
  "up" |
  "arrow-right" |
  "arrow-left";
type PublicIconSidebarName = 
  "store" | 
  "product" | 
  "receipt" | 
  "payout" | 
  "verification" | 
  "verified" |
  "ellipsis-vertical" |
  "percent" |
  "wallet" |
  "clock-9" |
  "file-search-corner" |
  "type" |
  "key" |
  "credit-card" |
  "shield-check" |
  "shield-minus" |
  "download" |
  "message-square-reply" |
  "rotate-ccw" |
  "check" |
  "link" |
  "warning" |
  "x" |
  "help"; 
type PublicIconActionName =
  "add" |
  "edit" |
  "delete" |
  "view" |
  "eye" |
  "eye-closed" |
  "settings";

type PublicIconProps = {
  name: PublicIconName | PublicIconSidebarName | PublicIconActionName;
  className?: string;
  label?: string;
};

/**
 * Renders an SVG from /public/icons as a CSS mask. Use Tailwind text-* classes
 * to set its color because bg-current inherits the element's current color.
 */
export default function PublicIcon({ name, className = "", label }: PublicIconProps) {
  const iconUrl = `/icons/${name}.svg`;

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={`inline-block h-5 w-5 shrink-0 bg-current ${className}`}
      style={{
        mask: `url(${iconUrl}) center / contain no-repeat`,
        WebkitMask: `url(${iconUrl}) center / contain no-repeat`,
      }}
    />
  );
}

export type { PublicIconName, PublicIconSidebarName, PublicIconActionName, PublicIconProps };
