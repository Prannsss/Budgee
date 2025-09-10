import Image from "next/image";
import type { HTMLAttributes } from "react";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={className} {...props}>
      <Image
        src="/favicon.ico"
        alt="Budgee Logo"
        width={24}
        height={24}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
