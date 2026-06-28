"use client";

import { getPointById, getCountryName, getHubYearlySeries } from "./data";
import TimeSeriesChart from "./TimeSeriesChart";

interface HubPanelProps {
  id: string;
  onBackToWorld: () => void;
  onBackToCountry: (iso: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  open: "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
  closed:
    "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  inactive:
    "border-zinc-300 bg-zinc-50 text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500",
  completed:
    "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export default function HubPanel({
  id,
  onBackToWorld,
  onBackToCountry,
}: HubPanelProps) {
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

  const countryName = getCountryName(point.iso);
  const series = getHubYearlySeries(id);
  const isDonor = point.type === "donor";
  const statLabel = isDonor ? "Donations" : "Receiving locations";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 flex-wrap">
        <button
          type="button"
          onClick={onBackToWorld}
          className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          World
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onBackToCountry(point.iso)}
          className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          {countryName}
        </button>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200 font-medium">
          {point.label}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {isDonor ? "Donor hub" : "Receiving center"}
        </h3>
        <p className="text-base text-zinc-700 dark:text-zinc-300">
          {point.label}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {statLabel}
        </h3>
        <p className="text-base text-zinc-700 dark:text-zinc-300">
          {point.count.toLocaleString()}
        </p>
      </div>

      {point.status && (
        <span
          className={`text-sm rounded-md px-2.5 py-1 border w-fit capitalize ${
            STATUS_STYLES[point.status] ?? STATUS_STYLES.open
          }`}
        >
          {point.status}
        </span>
      )}

      {series && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {isDonor ? "Donations" : "Receptions"} over time
          </h3>
          <TimeSeriesChart
            categories={series.years}
            series={[
              {
                label: series.role === "donated" ? "Donated" : "Received",
                color: series.role === "donated" ? "#2563EB" : "#EA580C",
                values: series.values,
              },
            ]}
            height={170}
          />
        </div>
      )}
    </div>
  );
}
