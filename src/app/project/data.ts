export interface DonorCountry {
  donations: number;
  name: string;
}

export interface ReceiverCountry {
  locations: number;
  name: string;
}

export interface LocationPoint {
  iso: string;
  lat: number;
  lng: number;
  type: "donor" | "receiver";
  count: number;
  label: string;
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
    iso: "DEU",
    lat: 52.52,
    lng: 13.4,
    type: "donor",
    count: 420,
    label: "Berlin Hub",
  },
  {
    iso: "DEU",
    lat: 48.13,
    lng: 11.57,
    type: "donor",
    count: 220,
    label: "Munich Hub",
  },
  {
    iso: "DEU",
    lat: 53.57,
    lng: 10.0,
    type: "donor",
    count: 200,
    label: "Hamburg Hub",
  },
  {
    iso: "USA",
    lat: 40.71,
    lng: -74.0,
    type: "donor",
    count: 380,
    label: "New York Hub",
  },
  {
    iso: "USA",
    lat: 34.05,
    lng: -118.24,
    type: "donor",
    count: 280,
    label: "Los Angeles Hub",
  },
  {
    iso: "USA",
    lat: 41.88,
    lng: -87.63,
    type: "donor",
    count: 310,
    label: "Chicago Hub",
  },
  {
    iso: "USA",
    lat: 37.77,
    lng: -122.42,
    type: "donor",
    count: 230,
    label: "San Francisco Hub",
  },
  {
    iso: "GBR",
    lat: 51.51,
    lng: -0.12,
    type: "donor",
    count: 340,
    label: "London Hub",
  },
  {
    iso: "GBR",
    lat: 53.48,
    lng: -2.24,
    type: "donor",
    count: 180,
    label: "Manchester Hub",
  },
  {
    iso: "FRA",
    lat: 48.85,
    lng: 2.35,
    type: "donor",
    count: 300,
    label: "Paris Hub",
  },
  {
    iso: "FRA",
    lat: 43.29,
    lng: 5.37,
    type: "donor",
    count: 180,
    label: "Marseille Hub",
  },
  {
    iso: "NLD",
    lat: 52.37,
    lng: 4.9,
    type: "donor",
    count: 390,
    label: "Amsterdam Hub",
  },
  {
    iso: "CHE",
    lat: 47.37,
    lng: 8.54,
    type: "donor",
    count: 310,
    label: "Zurich Hub",
  },
  {
    iso: "KEN",
    lat: -1.28,
    lng: 36.82,
    type: "receiver",
    count: 22,
    label: "Nairobi Center",
  },
  {
    iso: "KEN",
    lat: -4.05,
    lng: 39.66,
    type: "receiver",
    count: 18,
    label: "Mombasa Center",
  },
  {
    iso: "KEN",
    lat: 0.51,
    lng: 35.27,
    type: "receiver",
    count: 9,
    label: "Eldoret Center",
  },
  {
    iso: "KEN",
    lat: -0.1,
    lng: 34.75,
    type: "receiver",
    count: 9,
    label: "Kisumu Center",
  },
  {
    iso: "GHA",
    lat: 5.55,
    lng: -0.2,
    type: "receiver",
    count: 20,
    label: "Accra Center",
  },
  {
    iso: "GHA",
    lat: 6.69,
    lng: -1.62,
    type: "receiver",
    count: 14,
    label: "Kumasi Center",
  },
  {
    iso: "TZA",
    lat: -6.79,
    lng: 39.27,
    type: "receiver",
    count: 25,
    label: "Dar es Salaam",
  },
  {
    iso: "TZA",
    lat: -3.36,
    lng: 36.68,
    type: "receiver",
    count: 17,
    label: "Arusha Center",
  },
  {
    iso: "IND",
    lat: 28.61,
    lng: 77.2,
    type: "receiver",
    count: 28,
    label: "New Delhi Center",
  },
  {
    iso: "IND",
    lat: 19.07,
    lng: 72.87,
    type: "receiver",
    count: 22,
    label: "Mumbai Center",
  },
  {
    iso: "IND",
    lat: 12.97,
    lng: 77.59,
    type: "receiver",
    count: 17,
    label: "Bangalore Center",
  },
  {
    iso: "PHL",
    lat: 14.59,
    lng: 120.98,
    type: "receiver",
    count: 38,
    label: "Manila Center",
  },
  {
    iso: "ETH",
    lat: 9.03,
    lng: 38.74,
    type: "receiver",
    count: 31,
    label: "Addis Ababa",
  },
  {
    iso: "HTI",
    lat: 18.54,
    lng: -72.33,
    type: "receiver",
    count: 16,
    label: "Port-au-Prince",
  },
  {
    iso: "NGA",
    lat: 6.52,
    lng: 3.37,
    type: "receiver",
    count: 23,
    label: "Lagos Hub",
  },
  {
    iso: "NGA",
    lat: 9.05,
    lng: 7.49,
    type: "receiver",
    count: 21,
    label: "Abuja Hub",
  },
  {
    iso: "RWA",
    lat: -1.94,
    lng: 30.06,
    type: "receiver",
    count: 22,
    label: "Kigali Center",
  },
  {
    iso: "BGD",
    lat: 23.71,
    lng: 90.4,
    type: "receiver",
    count: 23,
    label: "Dhaka Center",
  },
  {
    iso: "NPL",
    lat: 27.7,
    lng: 85.31,
    type: "receiver",
    count: 19,
    label: "Kathmandu Center",
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
