export type MapView = { kind: "world" } | { kind: "country"; iso: string };
export type MapView =
  | { kind: "world" }
  | { kind: "country"; iso: string }
  | { kind: "hub"; id: string };
