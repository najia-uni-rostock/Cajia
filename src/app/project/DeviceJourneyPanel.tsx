"use client";

import {
  getDeviceJourney,
  getImpactDescription,
  STAGE_LABELS,
} from "./data";
import {
    type DeviceStage,
} from "./types"
interface DeviceJourneyPanelProps {
  serial: string;
  onBackToWorld: () => void;
}

const STAGES: DeviceStage[] = ["hub", "transit", "delivered"];

export default function DeviceJourneyPanel({
  serial,
  onBackToWorld,
}: DeviceJourneyPanelProps) {
  const journey = getDeviceJourney(serial);

  if (!journey) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onBackToWorld}
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to normal map
        </button>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Device not found.
        </p>
      </div>
    );
  }

  const { device, hub, village } = journey;
  const currentStageIndex = STAGES.indexOf(device.stage);
  const impact = village ? getImpactDescription(village.iso) : null;

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBackToWorld}
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline hover:text-zinc-700 dark:hover:text-zinc-200 w-fit"
      >
        ← Back to normal map
      </button>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Status of journey
        </h3>
        <div className="flex items-center gap-1 mt-1">
          {STAGES.map((stage, index) => (
            <div
              key={stage}
              className="flex items-center flex-1 last:flex-none"
            >
              <div
                className={`flex items-center justify-center rounded-full shrink-0 ${
                  index === currentStageIndex
                    ? "w-4 h-4 border-2 border-blue-600 dark:border-blue-400 bg-blue-100 dark:bg-blue-900"
                    : index < currentStageIndex
                      ? "w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400"
                      : "w-2.5 h-2.5 bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
              {index < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-[1.5px] ${
                    index < currentStageIndex
                      ? "bg-blue-600 dark:bg-blue-400"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {STAGES.map((stage) => (
            <span key={stage}>{STAGE_LABELS[stage]}</span>
          ))}
        </div>
      </div>

      {village ? (
        impact && (
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Impact
            </h3>
            <p className="text-base text-zinc-700 dark:text-zinc-300">
              {impact}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Based on placeholder income and device cost data
            </p>
          </div>
        )
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          This device hasn&apos;t reached a receiving village yet.
        </p>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {village ? "Receiving village" : "Current hub"}
        </h3>
        <p className="text-base text-zinc-700 dark:text-zinc-300">
          {village ? village.label : hub.label}
        </p>
        {village?.studentsServed !== undefined && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {village.studentsServed.toLocaleString()} students served
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Laptop info
        </h3>
        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
          <span className="text-zinc-400 dark:text-zinc-500">Model</span>
          <span className="text-zinc-700 dark:text-zinc-300 text-right">
            {device.model}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">Capacity</span>
          <span className="text-zinc-700 dark:text-zinc-300 text-right">
            {device.wh} Wh
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">Serial</span>
          <span className="text-zinc-700 dark:text-zinc-300 text-right">
            {device.serial}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">Status</span>
          <span className="text-zinc-700 dark:text-zinc-300 text-right">
            {device.statusCode}
          </span>
        </div>
      </div>
    </div>
  );
}
