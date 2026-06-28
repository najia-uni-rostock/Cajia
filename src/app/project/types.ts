export type MapView =
  | { kind: "world" }
  | { kind: "country"; iso: string }
  | { kind: "hub"; id: string }
  | { kind: "nearestHub"; id: string; distanceKm: number }
  | { kind: "deviceJourney"; serial: string };
