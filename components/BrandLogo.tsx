"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface BrandLogoProps {
  context?: "public" | "customer" | "admin" | "auto";
  variant?: "light" | "dark"; // "dark" text for light bg, "light" text for dark bg (like admin sidebar)
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  subText?: string;
  className?: string;
  onClick?: () => void;
}

export default function BrandLogo({
  context = "auto",
  variant = "dark",
  showText = true,
  size = "md",
  subText,
  className = "",
  onClick,
}: BrandLogoProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Determine current context if auto
  const resolvedContext =
    context === "auto"
      ? pathname.startsWith("/admin")
        ? "admin"
        : pathname.startsWith("/customer/dashboard") || pathname.startsWith("/customer/feedback")
        ? "customer"
        : "public"
      : context;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }

    if (resolvedContext === "admin") {
      e.preventDefault();
      if (pathname === "/admin") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/admin");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (resolvedContext === "customer") {
      e.preventDefault();
      if (pathname === "/customer/dashboard") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/customer/dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Public website
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Will navigate to "/" via Link href
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const getHref = () => {
    if (resolvedContext === "admin") return "/admin";
    if (resolvedContext === "customer") return "/customer/dashboard";
    return "/";
  };

  const sizeDimensions = {
    sm: { img: 34, text: "text-lg", sub: "text-[7.5px]" },
    md: { img: 42, text: "text-xl", sub: "text-[8.5px]" },
    lg: { img: 50, text: "text-2xl", sub: "text-[9.5px]" },
    xl: { img: 64, text: "text-3xl", sub: "text-[11px]" },
  }[size];

  const defaultSubText =
    subText !== undefined
      ? subText
      : resolvedContext === "admin"
      ? "ADMIN WORKSPACE"
      : "YOUR DREAM HOME, OUR DESIGN";

  return (
    <Link
      href={getHref()}
      onClick={handleClick}
      aria-label="Sarda Homeplan"
      className={`group inline-flex items-center gap-2.5 transition select-none ${className}`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full shadow-sm transition group-hover:scale-105"
        style={{
          width: sizeDimensions.img,
          height: sizeDimensions.img,
        }}
      >
        <Image
          src="/sarda-logo.png"
          alt="Sarda Homeplan"
          width={sizeDimensions.img * 2}
          height={sizeDimensions.img * 2}
          priority
          className="h-full w-full object-contain"
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <span
            className={`font-serif font-extrabold tracking-tight transition ${
              sizeDimensions.text
            } ${
              variant === "light"
                ? "text-white group-hover:text-[#f4cf72]"
                : "text-[#063b2c] group-hover:text-[#0b5c46]"
            }`}
          >
            SARDA
          </span>
          <span
            className={`block font-extrabold tracking-[0.28em] ${
              sizeDimensions.sub
            } ${variant === "light" ? "text-[#f4cf72]" : "text-[#9b7732]"}`}
          >
            {defaultSubText}
          </span>
        </div>
      )}
    </Link>
  );
}
