import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function PlayerAvatar({
  name,
  src,
  size = 44,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover object-top", className)}
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
