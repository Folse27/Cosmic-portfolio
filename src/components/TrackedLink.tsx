"use client";

import Link from "next/link";
import { trackClick } from "@/lib/track";

/**
 * A link that records a click event before navigating.
 * Internal hrefs use next/link; external ones render a plain anchor.
 */
export default function TrackedLink({
  href,
  trackId,
  external = false,
  className,
  children,
  ...rest
}: {
  href: string;
  trackId: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const onClick = () => trackClick(trackId);

  if (external) {
    return (
      <a href={href} onClick={onClick} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}
