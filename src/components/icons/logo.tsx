"use client";

import Image from "next/image";
import type { HTMLAttributes } from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use favicon.ico for light mode, budgeewhite.png for dark mode
  const logoSrc = mounted && resolvedTheme === "dark" 
    ? "/budgeewhite.png" 
    : "/favicon.ico";

  return (
    <div className={className} {...props}>
      <Image
        src={logoSrc}
        alt="Budgee Logo"
        width={24}
        height={24}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
