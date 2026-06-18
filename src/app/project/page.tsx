"use client"

import { useCallback } from "react";
import dynamic from "next/dynamic";

const LabdooMap = dynamic(() => import("./LabdooMap"), { ssr: false });

export default function Project() {
  const runDrawArrow = useCallback(() => {
    const fn = (window as any).labdooDrawArrow;
    if (typeof fn === "function") {
      fn(
        { lat: 52.52, lng: 13.4, label: "Berlin Hub", count: 420 },
        { lat: -1.28, lng: 36.82, label: "Nairobi Center", count: 22 }
      );
    } else {
      console.warn("labdooDrawArrow is not ready yet");
    }
  }, []);

  const runShowNearestDonorHub = useCallback(() => {
    const fn = (window as any).labdooShowNearestHub;
    if (typeof fn === "function") {
      fn(48.85, 2.35);
    } else {
      console.warn("labdooShowNearestHub is not ready yet");
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runDrawArrow}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Show donation arrow example
        </button>
        <button
          type="button"
          onClick={runShowNearestDonorHub}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Show nearest donor hub example
        </button>
      </div>
      <LabdooMap />
    </div>
  );
}
