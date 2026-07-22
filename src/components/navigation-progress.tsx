"use client";

import * as React from "react";

import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = React.useRef(pathname + searchParams.toString());

  React.useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPath.current) {
      prevPath.current = current;
      // Complete the bar
      setWidth(100);
      animRef.current = setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 300);
    }
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [pathname, searchParams]);

  // Start bar on click of any link
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      setLoading(true);
      setWidth(30);
      timerRef.current = setTimeout(() => setWidth(70), 300);
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!loading && width === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-0.5 bg-primary transition-all duration-300 ease-out"
      style={{ width: `${width}%`, opacity: loading || width < 100 ? 1 : 0 }}
    />
  );
}
