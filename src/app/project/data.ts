import Papa from "papaparse";
import { ISO_COUNTRY_NAMES } from "./countries";
import { YearlyTotal, Device, DeviceStage } from "./types";
import { YEARLY_TOTALS } from "./yearly_totals";
import { YEARLY_BY_COUNTRY } from "./yearly_by_country";
import { YEARLY_BY_EDOOVILLAGE } from "./yearly_by_edoovillage";
import { YEARLY_BY_HUB } from "./yearly_by_hub";
import { DEVICES } from "./devices";

export interface LocationPoint {
  id: string;
  iso: string;
  lat: number;
  lng: number;
  type: "donor" | "receiver";
  count: number;
  label: string;
  status?: "open" | "closed" | "inactive" | "completed";
  onDemand?: boolean; // donor hubs only
  studentsServed?: number; // receiving centers only
}

/* -----------------------------
   TYPES
------------------------------*/
export type DonorCountry = {
  donations: number;
  name: string;
};

export type ReceiverCountry = {
  locations: number;
  name: string;
};

export const DONORS: Record<string, DonorCountry> = {};
export const RECEIVERS: Record<string, ReceiverCountry> = {};

const NAME_TO_ISO: Record<string, string> = {};
for (const [iso, name] of Object.entries(ISO_COUNTRY_NAMES)) {
  NAME_TO_ISO[name] = iso;
}

const countryTotals = new Map<string, { donated: number; received: number }>();

for (const row of YEARLY_BY_COUNTRY) {
  const iso = NAME_TO_ISO[row.country];
  if (!iso) continue;
  const existing = countryTotals.get(iso) ?? { donated: 0, received: 0 };
  existing.donated += row.donated;
  existing.received += row.received;
  countryTotals.set(iso, existing);
}

for (const [iso, totals] of countryTotals) {
  const name = ISO_COUNTRY_NAMES[iso] ?? iso;
  if (totals.donated > 0) DONORS[iso] = { donations: totals.donated, name };
  if (totals.received > 0)
    RECEIVERS[iso] = { locations: totals.received, name };
}

const makeId = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const POINTS: LocationPoint[] = [];

// internal load once
const loadPoints = async () => {
  const res = await fetch("/map_points_data.csv");
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows = parsed.data as any[];

  const result: LocationPoint[] = rows.map((row) => {
    const type = row.type as "donor" | "receiver";

    const base: LocationPoint = {
      id: row.label,
      iso: row.iso,
      lat: Number(row.lat),
      lng: Number(row.lng),
      type,
      count: Number(row.count || 0),
      label: row.label,
    };

    if (type === "donor") {
      return {
        ...base,
        status: row.status as LocationPoint["status"],
        onDemand: row.onDemand === "true",
      };
    }

    return {
      ...base,
      status: row.status as LocationPoint["status"],
      studentsServed: row.studentsServed
        ? Number(row.studentsServed)
        : undefined,
    };
  });

  POINTS.push(...result);
};

// auto-run once when module is imported
loadPoints();

export const MEDIAN_INCOME: Record<string, number> = {
  DEU: 3800,
  USA: 4200,
  GBR: 3100,
  FRA: 3000,
  NLD: 3600,
  CHE: 5200,
  AUT: 3400,
  BEL: 3300,
  ESP: 2100,
  CAN: 3700,
  GHA: 150,
  KEN: 180,
  TZA: 110,
  UGA: 95,
  RWA: 100,
  MOZ: 85,
  ZMB: 120,
  CMR: 140,
  SEN: 160,
  ETH: 90,
  NGA: 200,
  IND: 220,
  BGD: 130,
  NPL: 110,
  PHL: 280,
  HTI: 75,
  BOL: 230,
};

export const DONATION_REASONS: Record<string, string[]> = {
  GHA: [
    "Limited access to computers in rural schools",
    "High device cost relative to local income",
  ],
  KEN: [
    "Growing number of students needing digital learning tools",
    "Few functioning computer labs outside major cities",
  ],
  TZA: [
    "Shortage of classroom computers in public schools",
    "High import cost of new devices",
  ],
  UGA: [
    "Limited electricity and device access in rural districts",
    "Strong demand for vocational digital training",
  ],
  RWA: [
    "National push for digital literacy in schools",
    "Shortage of affordable refurbished devices",
  ],
  MOZ: [
    "Few computer labs in secondary schools",
    "High cost of new devices relative to income",
  ],
  ZMB: [
    "Limited digital skills training infrastructure",
    "Shortage of devices in community learning centers",
  ],
  CMR: [
    "Growing student population without device access",
    "Limited budget for school technology",
  ],
  SEN: [
    "Expanding demand for digital literacy programs",
    "High cost of imported electronics",
  ],
  ETH: [
    "Shortage of computers in public schools",
    "Limited access to vocational tech training",
  ],
  NGA: [
    "Large student population relative to available devices",
    "High cost of new devices relative to income",
  ],
  IND: [
    "Rural schools with limited device access",
    "Strong demand for digital learning resources",
  ],
  BGD: [
    "Limited computer access in public schools",
    "Growing need for digital skills training",
  ],
  NPL: [
    "Few functioning computer labs in rural schools",
    "High import cost of new devices",
  ],
  PHL: [
    "Remote learning needs in underserved provinces",
    "Shortage of devices for vocational training",
  ],
  HTI: [
    "Limited school infrastructure and device access",
    "High cost of new devices relative to income",
  ],
  BOL: [
    "Few computer labs in rural communities",
    "Growing demand for digital literacy programs",
  ],
};

export function getCountryName(iso: string): string {
  return DONORS[iso]?.name ?? RECEIVERS[iso]?.name ?? iso;
}

export interface CountryYearlySeries {
  years: number[];
  donated: number[];
  received: number[];
}

export function getCountryYearlySeries(
  iso: string,
): CountryYearlySeries | null {
  const countryName = ISO_COUNTRY_NAMES[iso];
  if (!countryName) return null;

  const rows = YEARLY_BY_COUNTRY.filter((r) => r.country === countryName).sort(
    (a, b) => a.year - b.year,
  );

  if (rows.length === 0) return null;

  const minYear = rows[0].year;
  const maxYear = rows[rows.length - 1].year;

  const map = new Map<number, { donated: number; received: number }>();

  for (const r of rows) {
    map.set(r.year, {
      donated: r.donated,
      received: r.received,
    });
  }

  const years: number[] = [];
  const donated: number[] = [];
  const received: number[] = [];

  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
    donated.push(map.get(y)?.donated ?? 0);
    received.push(map.get(y)?.received ?? 0);
  }

  return {
    years,
    donated,
    received,
  };
}
export function getPointById(id: string): LocationPoint | undefined {
  console.log(id);
  return POINTS.find((p) => p.id === id);
}

export interface HubYearlySeries {
  years: number[];
  values: number[];
  role: "donated" | "received";
}

export function getHubYearlySeries(id: string): HubYearlySeries | null {
  const point = getPointById(id);
  console.log(point);
  if (!point) return null;

  const isReceiver = point.type === "receiver";
  const isDonator = point.type === "donor";
  console.log(isReceiver);
  const source = isReceiver
    ? YEARLY_BY_EDOOVILLAGE
    : isDonator
      ? YEARLY_BY_HUB
      : null;

  if (!source) return null;
  const entries = source
    .filter((e) =>
      isReceiver ? e.edooId.trim() == id.trim() : e.hubId.trim() == id.trim(),
    )
    .sort((a, b) => a.year - b.year);
  console.log(
    source.filter(
      (e) =>
        e.edooId ===
        "Edoovillage #2500 - Ukraine, Cherson: Hilfe für ukrainische",
    ),
  );
  console.log(entries);
  if (entries.length === 0) return null;

  return {
    years: entries.map((e) => e.year),
    values: entries.map((e) => e.devices ?? 0),
    role: point.type === "donor" ? "donated" : "received",
  };
}
export function isEligibleDonorHub(point: LocationPoint): boolean {
  return (
    point.type === "donor" //&& point.status === "open" && point.onDemand === true
  );
}

export const STAGE_LABELS: Record<DeviceStage, string> = {
  hub: "At hub",
  transit: "In transit",
  delivered: "Delivered",
};

// Mock device set spanning all three lifecycle stages and several hubs,
// so search results exercise hub/transit/delivered badges and (in S7)
// both "still at hub" and "has a village to draw an arc to" cases.

export function getDeviceBySerial(serial: string): Device | undefined {
  return DEVICES.find((d) => d.serial === serial);
}
export function searchDevicesBySerial(query: string, limit = 6): Device[] {
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 3) {
    return [];
  }

  return DEVICES.filter(
    (d) => d.serial?.toLowerCase().includes(normalized) ?? false,
  ).slice(0, limit);
}
export interface DeviceJourney {
  device: Device;
  hub: LocationPoint;
  village: LocationPoint | null;
}

export function getDeviceJourney(serial: string): DeviceJourney | null {
  const device = getDeviceBySerial(serial);
  if (!device) return null;
  const hub = getPointById(device.hubId);
  if (!hub) return null;
  const village = device.edooId ? (getPointById(device.edooId) ?? null) : null;
  return { device, hub, village };
}

// Placeholder until real Labdoo device-cost data is available.
export const AVERAGE_LAPTOP_PRICE_USD = 280;

export function getImpactDescription(iso: string): string | null {
  const monthlyIncome = MEDIAN_INCOME[iso];
  if (!monthlyIncome || monthlyIncome <= 0) return null;
  const weeklyIncome = monthlyIncome / 4.345;
  const weeks = Math.round(AVERAGE_LAPTOP_PRICE_USD / weeklyIncome);
  return `≈ ${weeks} ${weeks === 1 ? "week" : "weeks"} of average income in ${getCountryName(iso)}`;
}
