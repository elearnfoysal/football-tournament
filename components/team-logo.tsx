import Image from "next/image";
import { cn, initials } from "@/lib/utils";

interface TeamLogoProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

// Decorative: the team name is always rendered as text next to the logo.
export function TeamLogo({ name, src, size = 40, className }: TeamLogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary font-display font-bold text-secondary-foreground",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
