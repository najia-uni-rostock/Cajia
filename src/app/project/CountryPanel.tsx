"use client";

import {
  getCountryName,
  getCountryYearlySeries,
  MEDIAN_INCOME,
  DONATION_REASONS,
} from "./data";
import TimeSeriesChart from "./TimeSeriesChart";

interface CountryPanelProps {
  iso: string;
  onBackToWorld: () => void;
}

export default function CountryPanel({
  iso,
  onBackToWorld,
}: CountryPanelProps) {
  const name = getCountryName(iso);
  const income = MEDIAN_INCOME[iso];
  const reasons = DONATION_REASONS[iso];
  const series = getCountryYearlySeries(iso);
  const hasAnyData =
    income !== undefined || series !== null || (reasons && reasons.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={onBackToWorld}
          className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          World
        </button>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200 font-medium">
          {name}
        </span>
      </div>

      {income !== undefined && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Median income
          </h3>
          <p className="text-base text-zinc-700 dark:text-zinc-300">
            ${income.toLocaleString()} / month
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Source: World Bank
          </p>
        </div>
      )}

      {series && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Devices over time
          </h3>
<TimeSeriesChart
  categories={series.years}
  series={[
    {
      label: "Donated",
      color: "#2563EB",
      values: series.donated,
    },
    {
      label: "Received",
      color: "#EA580C",
      values: series.received,
    },
  ]}
  height={170}
/>
          
        </div>
      )}

      {reasons && reasons.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Why they need help
          </h3>
          <ul className="flex flex-col gap-1.5">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="text-sm text-zinc-700 dark:text-zinc-300 flex gap-2"
              >
                <span className="text-zinc-400 dark:text-zinc-500">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasAnyData && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No Labdoo activity recorded for this country yet.
        </p>
      )}
    </div>
  );
}
