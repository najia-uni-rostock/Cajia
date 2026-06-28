export interface DonorCountry {
  donations: number;
  name: string;
}

export interface ReceiverCountry {
  locations: number;
  name: string;
}

export interface LocationPoint {
  id: string;
  iso: string;
  lat: number;
  lng: number;
  type: "donor" | "receiver";
  count: number;
  label: string;
  status?: "open" | "closed" | "inactive" | "completed";
}

export interface YearlyTotal {
  year: number;
  donated: number;
  received: number;
}

export const DONORS: Record<string, DonorCountry> = {
  DEU: { donations: 840, name: "Germany" },
  USA: { donations: 1200, name: "United States" },
  GBR: { donations: 620, name: "United Kingdom" },
  FRA: { donations: 480, name: "France" },
  NLD: { donations: 390, name: "Netherlands" },
  CHE: { donations: 310, name: "Switzerland" },
  AUT: { donations: 220, name: "Austria" },
  BEL: { donations: 180, name: "Belgium" },
  ESP: { donations: 160, name: "Spain" },
  CAN: { donations: 290, name: "Canada" },
};

export const RECEIVERS: Record<string, ReceiverCountry> = {
  GHA: { locations: 34, name: "Ghana" },
  KEN: { locations: 58, name: "Kenya" },
  TZA: { locations: 42, name: "Tanzania" },
  UGA: { locations: 29, name: "Uganda" },
  RWA: { locations: 22, name: "Rwanda" },
  MOZ: { locations: 18, name: "Mozambique" },
  ZMB: { locations: 15, name: "Zambia" },
  CMR: { locations: 25, name: "Cameroon" },
  SEN: { locations: 12, name: "Senegal" },
  ETH: { locations: 31, name: "Ethiopia" },
  NGA: { locations: 44, name: "Nigeria" },
  IND: { locations: 67, name: "India" },
  BGD: { locations: 23, name: "Bangladesh" },
  NPL: { locations: 19, name: "Nepal" },
  PHL: { locations: 38, name: "Philippines" },
  HTI: { locations: 16, name: "Haiti" },
  BOL: { locations: 11, name: "Bolivia" },
};

export const POINTS: LocationPoint[] = [
  {
    id: "berlin-hub",
    iso: "DEU",
    lat: 52.52,
    lng: 13.4,
    type: "donor",
    count: 420,
    label: "Berlin Hub",
    status: "open",
  },
  {
    id: "munich-hub",
    iso: "DEU",
    lat: 48.13,
    lng: 11.57,
    type: "donor",
    count: 220,
    label: "Munich Hub",
    status: "closed",
  },
  {
    id: "hamburg-hub",
    iso: "DEU",
    lat: 53.57,
    lng: 10.0,
    type: "donor",
    count: 200,
    label: "Hamburg Hub",
    status: "open",
  },
  {
    id: "new-york-hub",
    iso: "USA",
    lat: 40.71,
    lng: -74.0,
    type: "donor",
    count: 380,
    label: "New York Hub",
    status: "open",
  },
  {
    id: "los-angeles-hub",
    iso: "USA",
    lat: 34.05,
    lng: -118.24,
    type: "donor",
    count: 280,
    label: "Los Angeles Hub",
    status: "open",
  },
  {
    id: "chicago-hub",
    iso: "USA",
    lat: 41.88,
    lng: -87.63,
    type: "donor",
    count: 310,
    label: "Chicago Hub",
    status: "open",
  },
  {
    id: "san-francisco-hub",
    iso: "USA",
    lat: 37.77,
    lng: -122.42,
    type: "donor",
    count: 230,
    label: "San Francisco Hub",
    status: "open",
  },
  {
    id: "london-hub",
    iso: "GBR",
    lat: 51.51,
    lng: -0.12,
    type: "donor",
    count: 340,
    label: "London Hub",
    status: "open",
  },
  {
    id: "manchester-hub",
    iso: "GBR",
    lat: 53.48,
    lng: -2.24,
    type: "donor",
    count: 180,
    label: "Manchester Hub",
    status: "open",
  },
  {
    id: "paris-hub",
    iso: "FRA",
    lat: 48.85,
    lng: 2.35,
    type: "donor",
    count: 300,
    label: "Paris Hub",
    status: "open",
  },
  {
    id: "marseille-hub",
    iso: "FRA",
    lat: 43.29,
    lng: 5.37,
    type: "donor",
    count: 180,
    label: "Marseille Hub",
    status: "inactive",
  },
  {
    id: "amsterdam-hub",
    iso: "NLD",
    lat: 52.37,
    lng: 4.9,
    type: "donor",
    count: 390,
    label: "Amsterdam Hub",
    status: "open",
  },
  {
    id: "zurich-hub",
    iso: "CHE",
    lat: 47.37,
    lng: 8.54,
    type: "donor",
    count: 310,
    label: "Zurich Hub",
    status: "open",
  },
  {
    id: "nairobi-center",
    iso: "KEN",
    lat: -1.28,
    lng: 36.82,
    type: "receiver",
    count: 22,
    label: "Nairobi Center",
    status: "open",
  },
  {
    id: "mombasa-center",
    iso: "KEN",
    lat: -4.05,
    lng: 39.66,
    type: "receiver",
    count: 18,
    label: "Mombasa Center",
    status: "open",
  },
  {
    id: "eldoret-center",
    iso: "KEN",
    lat: 0.51,
    lng: 35.27,
    type: "receiver",
    count: 9,
    label: "Eldoret Center",
    status: "open",
  },
  {
    id: "kisumu-center",
    iso: "KEN",
    lat: -0.1,
    lng: 34.75,
    type: "receiver",
    count: 9,
    label: "Kisumu Center",
    status: "open",
  },
  {
    id: "accra-center",
    iso: "GHA",
    lat: 5.55,
    lng: -0.2,
    type: "receiver",
    count: 20,
    label: "Accra Center",
    status: "open",
  },
  {
    id: "kumasi-center",
    iso: "GHA",
    lat: 6.69,
    lng: -1.62,
    type: "receiver",
    count: 14,
    label: "Kumasi Center",
    status: "completed",
  },
  {
    id: "dar-es-salaam-center",
    iso: "TZA",
    lat: -6.79,
    lng: 39.27,
    type: "receiver",
    count: 25,
    label: "Dar es Salaam",
    status: "open",
  },
  {
    id: "arusha-center",
    iso: "TZA",
    lat: -3.36,
    lng: 36.68,
    type: "receiver",
    count: 17,
    label: "Arusha Center",
    status: "completed",
  },
  {
    id: "new-delhi-center",
    iso: "IND",
    lat: 28.61,
    lng: 77.2,
    type: "receiver",
    count: 28,
    label: "New Delhi Center",
    status: "open",
  },
  {
    id: "mumbai-center",
    iso: "IND",
    lat: 19.07,
    lng: 72.87,
    type: "receiver",
    count: 22,
    label: "Mumbai Center",
    status: "open",
  },
  {
    id: "bangalore-center",
    iso: "IND",
    lat: 12.97,
    lng: 77.59,
    type: "receiver",
    count: 17,
    label: "Bangalore Center",
    status: "open",
  },
  {
    id: "manila-center",
    iso: "PHL",
    lat: 14.59,
    lng: 120.98,
    type: "receiver",
    count: 38,
    label: "Manila Center",
    status: "open",
  },
  {
    id: "addis-ababa-center",
    iso: "ETH",
    lat: 9.03,
    lng: 38.74,
    type: "receiver",
    count: 31,
    label: "Addis Ababa",
    status: "open",
  },
  {
    id: "port-au-prince-center",
    iso: "HTI",
    lat: 18.54,
    lng: -72.33,
    type: "receiver",
    count: 16,
    label: "Port-au-Prince",
    status: "open",
  },
  {
    id: "lagos-hub",
    iso: "NGA",
    lat: 6.52,
    lng: 3.37,
    type: "receiver",
    count: 23,
    label: "Lagos Hub",
    status: "open",
  },
  {
    id: "abuja-hub",
    iso: "NGA",
    lat: 9.05,
    lng: 7.49,
    type: "receiver",
    count: 21,
    label: "Abuja Hub",
    status: "open",
  },
  {
    id: "kigali-center",
    iso: "RWA",
    lat: -1.94,
    lng: 30.06,
    type: "receiver",
    count: 22,
    label: "Kigali Center",
    status: "open",
  },
  {
    id: "dhaka-center",
    iso: "BGD",
    lat: 23.71,
    lng: 90.4,
    type: "receiver",
    count: 23,
    label: "Dhaka Center",
    status: "open",
  },
  {
    id: "kathmandu-center",
    iso: "NPL",
    lat: 27.7,
    lng: 85.31,
    type: "receiver",
    count: 19,
    label: "Kathmandu Center",
    status: "open",
  },
];

export const YEARLY_TOTALS: YearlyTotal[] = [
  { year: 2018, donated: 1800, received: 1400 },
  { year: 2019, donated: 2400, received: 1900 },
  { year: 2020, donated: 2100, received: 1700 },
  { year: 2021, donated: 2900, received: 2300 },
  { year: 2022, donated: 3300, received: 2600 },
  { year: 2023, donated: 3800, received: 3100 },
  { year: 2024, donated: 4200, received: 3500 },
];

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
  values: number[];
  role: "donated" | "received";
}

export function getCountryYearlySeries(
  iso: string,
): CountryYearlySeries | null {
  const donor = DONORS[iso];
  if (donor) {
    const totalDonated = YEARLY_TOTALS.reduce((sum, y) => sum + y.donated, 0);
    return {
      years: YEARLY_TOTALS.map((y) => y.year),
      values: YEARLY_TOTALS.map((y) =>
        Math.round((y.donated / totalDonated) * donor.donations),
      ),
      role: "donated",
    };
  }

  const receiver = RECEIVERS[iso];
  if (receiver) {
    const totalLocations = Object.values(RECEIVERS).reduce(
      (sum, r) => sum + r.locations,
      0,
    );
    const countryShare = receiver.locations / totalLocations;
    return {
      years: YEARLY_TOTALS.map((y) => y.year),
      values: YEARLY_TOTALS.map((y) => Math.round(y.received * countryShare)),
      role: "received",
    };
  }

  return null;
}
export function getPointById(id: string): LocationPoint | undefined {
  return POINTS.find((p) => p.id === id);
}

export interface HubYearlySeries {
  years: number[];
  values: number[];
  role: "donated" | "received";
}

export function getHubYearlySeries(id: string): HubYearlySeries | null {
  const point = getPointById(id);
  if (!point) return null;

  const countrySeries = getCountryYearlySeries(point.iso);
  if (!countrySeries) return null;

  const siblingTotal = POINTS.filter(
    (p) => p.iso === point.iso && p.type === point.type,
  ).reduce((sum, p) => sum + p.count, 0);

  const share = siblingTotal > 0 ? point.count / siblingTotal : 0;

  return {
    years: countrySeries.years,
    values: countrySeries.values.map((v) => Math.round(v * share)),
    role: countrySeries.role,
  };
}
