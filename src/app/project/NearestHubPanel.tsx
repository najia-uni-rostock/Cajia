"use client";

import { getPointById } from "./data";

interface NearestHubPanelProps {
  id: string;
  distanceKm: number;
  onBackToWorld: () => void;
  onViewHubDetails: (id: string) => void;
}

export default function NearestHubPanel({
  id,
  distanceKm,
  onBackToWorld,
  onViewHubDetails,
}: NearestHubPanelProps) {
  const point = getPointById(id);

  if (!point) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onBackToWorld}
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to world
        </button>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Hub not found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBackToWorld}
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline hover:text-zinc-700 dark:hover:text-zinc-200 w-fit"
      >
        ← Back to world
      </button>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Nearest hub
        </h3>
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-100">
          {point.label}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          ≈ {distanceKm.toLocaleString()} km away
        </p>
      </div>

      <span className="text-sm rounded-md px-2.5 py-1 border w-fit border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
        Open · accepting donations
      </span>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Other donor hubs nearby are shown in gray — they&apos;re either closed
        or not currently accepting devices.
      </p>

      <button
        type="button"
        onClick={() => onViewHubDetails(id)}
        className="text-sm rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-fit"
      >
        View hub details
      </button>
    </div>
  );
}
