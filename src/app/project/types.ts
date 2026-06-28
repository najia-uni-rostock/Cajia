export type MapView =
  | { kind: "world" }
  | { kind: "country"; iso: string }
  | { kind: "hub"; id: string }
  | { kind: "nearestHub"; id: string; distanceKm: number }
  | { kind: "deviceJourney"; serial: string };
  
export interface YearlyTotal {
  year: number;
  donated: number;
  received: number;
}
export interface YearlyCountry {
  year: number;
  country: string;
  donated: number;
  received: number;
}
export interface YearlyCountry {
  year: number;
  country: string;
  donated: number;
  received: number;
}
export interface YearlyCountry {
  year: number;
  country: string;
  donated: number;
  received: number;
}
export interface YearlyCountry {
  year: number;
  country: string;
  donated: number;
  received: number;
}
export interface YearlyCountry {
  year: number;
  country: string;
  donated: number;
  received: number;
}
export interface YearlyEdoovillage {
  year: number;
  edooId: string;
  devices: number;
}
export interface YearlyHub {
  year: number;
  hubId: string;
  devices: number;
}
export type DeviceStage = "hub" | "transit" | "delivered";

export interface Device {
  serial: string;
  model: string;
  wh: number;
  dateCreated: string;
  stage: DeviceStage;
  statusCode: string;
  hubId: string;
  villageId?: string; // only set once stage === "delivered"
}
