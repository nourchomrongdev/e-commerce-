"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MIN_LOADING_DURATION = 260;

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const loadingRef = useRef(false);
  const startedAt = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  };

  const finishLoading = () => {
    clearTimers();
    setProgress(100);

    finishTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
      loadingRef.current = false;
      finishTimeoutRef.current = null;
    }, 180);
  };

  const startLoading = () => {
    clearTimers();

    startedAt.current = Date.now();
    loadingRef.current = true;
    setVisible(true);
    setProgress(12);

    intervalRef.current = window.setInterval(() => {
      setProgress((current) => {
        const delta = Math.min(26, Math.max(8, 92 - current) * 0.32 + 8);
        return Math.min(current + delta, 92);
      });
    }, 180);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank"
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin === window.location.origin &&
        destination.href !== window.location.href
      ) {
        startLoading();
      }
    };

    window.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", startLoading);

    return () => {
      clearTimers();
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", startLoading);
    };
  }, []);

  useEffect(() => {
    if (!loadingRef.current) return;

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, MIN_LOADING_DURATION - elapsed);

    finishTimeoutRef.current = window.setTimeout(() => {
      finishLoading();
    }, remaining);
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`route-loading-bar ${visible ? "route-loading-bar--active" : ""}`}
      style={{ width: visible ? `${progress}%` : "0%", opacity: visible ? 1 : 0 }}
    />
  );
}
