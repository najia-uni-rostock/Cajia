"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchDevicesBySerial, STAGE_LABELS, type DeviceStage } from "./data";

interface SearchOverlayProps {
  onClose: () => void;
  onSelectDevice: (serial: string) => void;
}

const STAGE_BADGE_STYLES: Record<DeviceStage, string> = {
  hub: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300",
  transit:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  delivered:
    "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
};

export default function SearchOverlay({
  onClose,
  onSelectDevice,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchDevicesBySerial(query), [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[1200] bg-black/40 dark:bg-black/60 flex flex-col items-center pt-20 px-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow"
      >
        ← Back to normal map
      </button>

      <div className="w-full max-w-md flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 shadow">
          <span className="text-zinc-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (results.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const picked = results[highlightedIndex];
                if (picked) onSelectDevice(picked.serial);
              }
            }}
            placeholder="Search by serial number, e.g. LBD-0048"
            className="flex-1 bg-transparent text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        {query.trim().length > 0 && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow overflow-hidden">
            {results.length === 0 ? (
              <p className="px-3.5 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                No matching devices found.
              </p>
            ) : (
              results.map((device, index) => (
                <button
                  key={device.serial}
                  type="button"
                  onClick={() => onSelectDevice(device.serial)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 transition-colors ${
                    index === highlightedIndex
                      ? "bg-zinc-50 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {device.serial}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {device.model}
                    </span>
                  </span>
                  <span
                    className={`text-sm rounded-md px-2 py-0.5 border whitespace-nowrap ${STAGE_BADGE_STYLES[device.stage]}`}
                  >
                    {STAGE_LABELS[device.stage]}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
