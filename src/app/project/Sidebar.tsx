"use client";

import { useMemo, useState } from "react";
import { DONORS, RECEIVERS } from "./data";
import { YEARLY_TOTALS } from "./yearly_totals";
import TimeSeriesChart from "./TimeSeriesChart";
import CountryPanel from "./CountryPanel";
import HubPanel from "./HubPanel";
import type { MapView } from "./types";
import NearestHubPanel from "./NearestHubPanel";
import DeviceJourneyPanel from "./DeviceJourneyPanel";

type RankingMode = "donating" | "receiving";

interface SidebarProps {
  view: MapView;
  onBackToWorld: () => void;
  onBackToCountry: (iso: string) => void;
  onShowNearestHub: () => void;
  onViewHubDetails: (id: string) => void;
  onOpenSearch: () => void;
  locationError: string | null;
  isLocatingNearestHub: boolean;
}

export default function Sidebar({
  view,
  onBackToWorld,
  onBackToCountry,
  onShowNearestHub,
  onViewHubDetails,
  onOpenSearch,
  locationError,
  isLocatingNearestHub,
}: SidebarProps) {
  const [rankingMode, setRankingMode] = useState<RankingMode>("donating");
  const [donatePanelOpen, setDonatePanelOpen] = useState(false);

  const ranking = useMemo(() => {
    if (rankingMode === "donating") {
      return Object.values(DONORS)
        .map((d) => ({ name: d.name, value: d.donations }))
        .sort((a, b) => b.value - a.value);
    }
    return Object.values(RECEIVERS)
      .map((r) => ({ name: r.name, value: r.locations }))
      .sort((a, b) => b.value - a.value);
  }, [rankingMode]);

  const maxValue = ranking[0]?.value ?? 1;
  const barColor = rankingMode === "donating" ? "#2563EB" : "#EA580C";

  return (
    <aside className="w-[340px] shrink-0 h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setDonatePanelOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 w-full rounded-lg border px-3.5 py-2.5 text-base font-medium transition-colors ${
            donatePanelOpen
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
        >
          <span className="text-lg">💻</span>
          <span className="flex-1 text-left">Donate a device</span>
          <span className="text-sm">{donatePanelOpen ? "▲" : "▼"}</span>
        </button>

        {donatePanelOpen && (
          <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
            <a
              href="https://platform.labdoo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>↗</span>
              Donate at Labdoo website
            </a>

            <button
              type="button"
              onClick={onShowNearestHub}
              disabled={isLocatingNearestHub}
              className="flex items-center gap-2.5 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLocatingNearestHub ? (
                <span className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
              ) : (
                <span>📍</span>
              )}
              {isLocatingNearestHub ? "Locating…" : "Show your nearest hub"}
            </button>
            {locationError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {locationError}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="text-lg">🔍</span>
          Search your device
        </button>
      </div>

      {view.kind === "world" ? (
        <>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Ranking
            </h3>
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {ranking.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {item.name}
                  </div>
                  <div className="flex-1 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-zinc-500 dark:text-zinc-400">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setRankingMode("donating")}
                className={`flex-1 text-sm rounded-md px-2.5 py-1.5 border transition-colors ${
                  rankingMode === "donating"
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                Donating
              </button>
              <button
                type="button"
                onClick={() => setRankingMode("receiving")}
                className={`flex-1 text-sm rounded-md px-2.5 py-1.5 border transition-colors ${
                  rankingMode === "receiving"
                    ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                Receiving
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Devices over time
            </h3>
            <TimeSeriesChart
              categories={YEARLY_TOTALS.map((y) => y.year)}
              series={[
                {
                  label: "Donated",
                  color: "#2563EB",
                  values: YEARLY_TOTALS.map((y) => y.donated),
                },
                {
                  label: "Received",
                  color: "#EA580C",
                  values: YEARLY_TOTALS.map((y) => y.received),
                },
              ]}
              height={190}
            />
          </div>
        </>
      ) : view.kind === "country" ? (
        <CountryPanel iso={view.iso} onBackToWorld={onBackToWorld} />
      ) : view.kind === "hub" ? (
        <HubPanel
          id={view.id}
          onBackToWorld={onBackToWorld}
          onBackToCountry={onBackToCountry}
        />
      ) : view.kind === "nearestHub" ? (
        <NearestHubPanel
          id={view.id}
          distanceKm={view.distanceKm}
          onBackToWorld={onBackToWorld}
          onViewHubDetails={onViewHubDetails}
        />
      ) : (
        <DeviceJourneyPanel
          serial={view.serial}
          onBackToWorld={onBackToWorld}
        />
      )}
    </aside>
  );
}
