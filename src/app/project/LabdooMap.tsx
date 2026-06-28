"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  DONORS,
  RECEIVERS,
  POINTS,
  getPointById,
  isEligibleDonorHub,
  getDeviceJourney,
} from "./data";
import type { MapView } from "./types";

const NUM_TO_ISO: Record<string, string> = {
  "4": "AFG",
  "8": "ALB",
  "12": "DZA",
  "24": "AGO",
  "32": "ARG",
  "36": "AUS",
  "40": "AUT",
  "50": "BGD",
  "56": "BEL",
  "64": "BTN",
  "68": "BOL",
  "76": "BRA",
  "100": "BGR",
  "116": "KHM",
  "120": "CMR",
  "124": "CAN",
  "144": "LKA",
  "152": "CHL",
  "156": "CHN",
  "170": "COL",
  "180": "COD",
  "188": "CRI",
  "191": "HRV",
  "192": "CUB",
  "204": "BEN",
  "208": "DNK",
  "218": "ECU",
  "818": "EGY",
  "231": "ETH",
  "246": "FIN",
  "250": "FRA",
  "266": "GAB",
  "276": "DEU",
  "288": "GHA",
  "320": "GTM",
  "324": "GIN",
  "332": "HTI",
  "340": "HND",
  "356": "IND",
  "360": "IDN",
  "364": "IRN",
  "368": "IRQ",
  "372": "IRL",
  "376": "ISR",
  "380": "ITA",
  "388": "JAM",
  "392": "JPN",
  "404": "KEN",
  "410": "KOR",
  "418": "LAO",
  "422": "LBN",
  "430": "LBR",
  "434": "LBY",
  "450": "MDG",
  "454": "MWI",
  "458": "MYS",
  "466": "MLI",
  "484": "MEX",
  "504": "MAR",
  "508": "MOZ",
  "516": "NAM",
  "524": "NPL",
  "528": "NLD",
  "558": "NIC",
  "566": "NGA",
  "578": "NOR",
  "586": "PAK",
  "591": "PAN",
  "598": "PNG",
  "600": "PRY",
  "604": "PER",
  "608": "PHL",
  "616": "POL",
  "620": "PRT",
  "642": "ROU",
  "643": "RUS",
  "646": "RWA",
  "682": "SAU",
  "686": "SEN",
  "694": "SLE",
  "706": "SOM",
  "710": "ZAF",
  "724": "ESP",
  "729": "SDN",
  "752": "SWE",
  "756": "CHE",
  "760": "SYR",
  "764": "THA",
  "768": "TGO",
  "780": "TTO",
  "788": "TUN",
  "792": "TUR",
  "800": "UGA",
  "804": "UKR",
  "826": "GBR",
  "840": "USA",
  "858": "URY",
  "862": "VEN",
  "704": "VNM",
  "887": "YEM",
  "894": "ZMB",
  "716": "ZWE",
};

const SKIP_IDS = new Set(["10", "-99", "null"]);

const MAX_D = Math.max(...Object.values(DONORS).map((d) => d.donations));
const MAX_R = Math.max(...Object.values(RECEIVERS).map((d) => d.locations));

function donorFill(v: number) {
  const t = v / MAX_D;
  return `rgba(${Math.round(219 - t * 180)},${Math.round(234 - t * 185)},251,${(0.3 + t * 0.6).toFixed(2)})`;
}
function receiverFill(v: number) {
  const t = v / MAX_R;
  return `rgba(251,${Math.round(243 - t * 160)},${Math.round(200 - t * 170)},${(0.3 + t * 0.6).toFixed(2)})`;
}

/**
 * Clamp a longitude into [-180, 180].
 * Returns null if the coordinate is clearly an antimeridian artefact
 * (i.e. a vertex sitting exactly on ±180 that belongs to a degenerate edge).
 */
function clampLng(lng: number): number {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

/**
 * Remove antimeridian-crossing artefacts from a GeoJSON feature collection.
 * The world-atlas 110m dataset contains a handful of polygons whose rings
 * span across the antimeridian; the browser SVG renderer draws them as
 * horizontal lines that bisect the map. We detect such rings by checking
 * whether consecutive vertices jump more than 180° in longitude, and drop
 * the offending feature entirely (they are tiny uninhabited island groups
 * that are invisible at zoom-2 anyway).
 */
function stripAntimeridianArtifacts(geojson: any): any {
  function ringHasAntimeridianJump(coords: number[][]): boolean {
    for (let i = 1; i < coords.length; i++) {
      const dLng = Math.abs(coords[i][0] - coords[i - 1][0]);
      if (dLng > 180) return true;
    }
    return false;
  }

  function geometryHasJump(geom: any): boolean {
    if (!geom) return false;
    if (geom.type === "Polygon") {
      return geom.coordinates.some((ring: number[][]) =>
        ringHasAntimeridianJump(ring),
      );
    }
    if (geom.type === "MultiPolygon") {
      return geom.coordinates.some((poly: number[][][]) =>
        poly.some((ring: number[][]) => ringHasAntimeridianJump(ring)),
      );
    }
    return false;
  }

  return {
    ...geojson,
    features: geojson.features.filter((f: any) => !geometryHasJump(f.geometry)),
  };
}

/** Haversine distance in km */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function loadScript(src: string, check: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (check()) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function loadCSS(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export interface LabdooMapHandle {
  resetToWorldView: () => void;
  focusCountry: (iso: string) => void;
  showNearestHub: (lat: number, lng: number) => void;
  focusHub: (id: string) => void;
  showDeviceJourney: (serial: string) => void;
}

interface LabdooMapProps {
  onViewChange?: (view: MapView) => void;
  onNoEligibleHubsFound?: () => void;
}

const LabdooMap = forwardRef<LabdooMapHandle, LabdooMapProps>(
  function LabdooMap({ onViewChange, onNoEligibleHubsFound }, ref) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mountedRef = useRef(false);
    const onViewChangeRef = useRef(onViewChange);
    const onNoEligibleHubsFoundRef = useRef(onNoEligibleHubsFound);
    const actionsRef = useRef<{
      resetToWorldView: () => void;
      focusCountry: (iso: string) => void;
      showNearestHub: (lat: number, lng: number) => void;
      focusHub: (id: string) => void;
      showDeviceJourney: (serial: string) => void;
    } | null>(null);

    useEffect(() => {
      onViewChangeRef.current = onViewChange;
      onNoEligibleHubsFoundRef.current = onNoEligibleHubsFound;
    }, [onViewChange, onNoEligibleHubsFound]);

    useImperativeHandle(ref, () => ({
      resetToWorldView: () => actionsRef.current?.resetToWorldView(),
      focusCountry: (iso: string) => actionsRef.current?.focusCountry(iso),
      showNearestHub: (lat: number, lng: number) =>
        actionsRef.current?.showNearestHub(lat, lng),
      focusHub: (id: string) => actionsRef.current?.focusHub(id),
      showDeviceJourney: (serial: string) =>
        actionsRef.current?.showDeviceJourney(serial),
    }));

    useEffect(() => {
      if (!mapRef.current || mountedRef.current) return;
      mountedRef.current = true;

      loadCSS("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css");
      loadCSS(
        "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
      );
      loadCSS(
        "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
      );

      // Inject keyframe animation for the animated arrow
      if (!document.getElementById("lbdoo-keyframes")) {
        const style = document.createElement("style");
        style.id = "lbdoo-keyframes";
        style.textContent = `
        @keyframes lbdoo-dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes lbdoo-dash-move {
          to { stroke-dashoffset: -18; }
        }
        @keyframes lbdoo-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes lbdoo-plonk {
          0%,100% { transform: translateY(0) scale(1); opacity: 1; }
          50%      { transform: translateY(-6px) scale(1.1); opacity: 0.8; }
        }
      `;
        document.head.appendChild(style);
      }

      const init = async () => {
        const w = window as any;

        await loadScript(
          "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js",
          () => !!w.L,
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
          () => typeof w.L?.MarkerClusterGroup !== "undefined",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js",
          () => !!w.topojson,
        );

        const L = w.L;
        const topojson = w.topojson;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [20, 10],
          zoom: 2,
          minZoom: 2,
          maxZoom: 12,
          worldCopyJump: true,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · CartoDB',
            subdomains: "abcd",
            opacity: 0.95,
          },
        ).addTo(map);

        let geoLayer: any = null;
        let clusterLayer: any = null;
        let activeISO: string | null = null;
        let selectedPointId: string | null = null;
        let nearestHubModeActive = false;

        // Arrow / nearest-hub state
        let arrowSvgOverlay: HTMLElement | null = null; // overlay element for animated arch
        let arrowPathEl: SVGPathElement | null = null;
        let arrowShadowEl: SVGPathElement | null = null;
        let arrowPlaneEl: SVGElement | null = null;
        let arrowDotEl: SVGElement | null = null;
        let arrowInfoVisible = false;
        let currentArrowParams: { donor: any; receiver: any } | null = null;
        let nearestMarker: any = null; // user plonk
        let journeyEndpointsLayer: any = null;
        // ─── Animated arch arrow ──────────────────────────────────────────────────
        /**
         * drawDonationArrow(donor, receiver)
         * donor/receiver: { lat, lng, label }
         * Draws an animated curved arrow from donor to receiver, fades choropleth,
         * shows an info box top-right, and adds a "Go back" button bottom-right.
         */
        function renderArrowOverlay(
          donor: { lat: number; lng: number; label: string; count?: number },
          receiver: { lat: number; lng: number; label: string; count?: number },
        ) {
          if (!mapRef.current) return;

          const pD = map.latLngToContainerPoint([donor.lat, donor.lng]);
          const pR = map.latLngToContainerPoint([receiver.lat, receiver.lng]);

          const mx = (pD.x + pR.x) / 2;
          const my = (pD.y + pR.y) / 2;
          const dx = pR.x - pD.x;
          const dy = pR.y - pD.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const lift = Math.max(dist * 0.35, 60);
          // Reverse arc direction by flipping the perpendicular offset.
          const perpX = -dy / dist;
          const perpY = dx / dist;
          const cpx = mx + perpX * lift;
          const cpy = my + perpY * lift;

          const pathD = `M ${pD.x} ${pD.y} Q ${cpx} ${cpy} ${pR.x} ${pR.y}`;

          const size = map.getSize();
          const W = size.x;
          const H = size.y;
          const mapContainer = map.getContainer();
          const computedPosition =
            window.getComputedStyle(mapContainer).position;
          if (!computedPosition || computedPosition === "static") {
            mapContainer.style.position = "relative";
          }

          if (!arrowSvgOverlay) {
            const svgHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
                 style="position:absolute;top:0;left:0;pointer-events:none;">
              <defs>
                <filter id="lbdoo-glow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <linearGradient id="lbdoo-plane-shine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#facc15" stop-opacity="0.95" />
                  <stop offset="50%" stop-color="#fde68a" stop-opacity="1" />
                  <stop offset="100%" stop-color="#facc15" stop-opacity="0.95" />
                </linearGradient>
              </defs>
              <path id="lbdoo-shadow" fill="none"
                    stroke="rgba(250,204,21,0.12)" stroke-width="10"
                    stroke-linecap="round" filter="url(#lbdoo-glow)"/>
              <path id="lbdoo-arch-path" fill="none"
                    stroke="#facc15" stroke-width="2.5" stroke-linecap="round"
                    stroke-dasharray="8 10" stroke-linejoin="round"
                    opacity="0.96"
                    style="animation:lbdoo-dash-move 1.3s linear infinite;"/>
              <g filter="url(#lbdoo-glow)">
                <path id="lbdoo-plane" d="M-10,-4 L10,0 L-10,4 Z" fill="url(#lbdoo-plane-shine)" opacity="0.95">
                  <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#lbdoo-arch-path" />
                  </animateMotion>
                </path>
              </g>
              <circle id="lbdoo-plane-dot" r="3.5" fill="#fff" opacity="0.95" style="transform: translate(-50%, -50%);">
                <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.12s" rotate="auto">
                  <mpath href="#lbdoo-arch-path" />
                </animateMotion>
              </circle>
            </svg>`;
            const svgEl = document.createElement("div");
            svgEl.id = "lbdoo-arrow-svg";
            svgEl.style.cssText =
              "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:650;";
            svgEl.innerHTML = svgHTML;
            mapContainer.appendChild(svgEl);
            arrowSvgOverlay = svgEl;
            arrowPathEl = svgEl.querySelector("#lbdoo-arch-path");
            arrowShadowEl = svgEl.querySelector("#lbdoo-shadow");
            arrowPlaneEl = svgEl.querySelector("#lbdoo-plane");
            arrowDotEl = svgEl.querySelector("#lbdoo-plane-dot");
          } else {
            const svgEl = arrowSvgOverlay.querySelector("svg");
            if (svgEl) {
              svgEl.setAttribute("width", `${W}`);
              svgEl.setAttribute("height", `${H}`);
            }
          }

          arrowPathEl?.setAttribute("d", pathD);
          arrowShadowEl?.setAttribute("d", pathD);
          arrowPlaneEl?.setAttribute("d", "M-10,-4 L10,0 L-10,4 Z");
          arrowDotEl?.setAttribute("r", "3.5");
        }

        function drawDonationArrow(
          donor: { lat: number; lng: number; label: string; count?: number },
          receiver: { lat: number; lng: number; label: string; count?: number },
        ) {
          clearArrow();
          arrowInfoVisible = true;
          currentArrowParams = { donor, receiver };

          if (geoLayer)
            geoLayer.setStyle(() => ({
              fillColor: "#d4d4d4",
              fillOpacity: 0.08,
              color: "#bbb",
              weight: 0.4,
              opacity: 0.2,
            }));

          if (clusterLayer) {
            map.removeLayer(clusterLayer);
            clusterLayer = null;
          }

          const donorIcon = L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const receiverIcon = L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#EA580C;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          journeyEndpointsLayer = L.layerGroup([
            L.marker([donor.lat, donor.lng], { icon: donorIcon }).bindPopup(
              `<b>${donor.label}</b><br>Hub`,
            ),
            L.marker([receiver.lat, receiver.lng], {
              icon: receiverIcon,
            }).bindPopup(`<b>${receiver.label}</b><br>Village`),
          ]).addTo(map);

          renderArrowOverlay(donor, receiver);
        }

        function clearArrow() {
          arrowInfoVisible = false;
          if (arrowSvgOverlay) {
            arrowSvgOverlay.remove();
            arrowSvgOverlay = null;
          }
          if (journeyEndpointsLayer) {
            map.removeLayer(journeyEndpointsLayer);
            journeyEndpointsLayer = null;
          }
          currentArrowParams = null;
        }

        // ─── Nearest donor hub ────────────────────────────────────────────────────
        /**
         * showNearestDonorHub(lat, lng)
         * Places a red plonk at the given coords, finds the nearest donor POINT,
         * highlights it with an orange ring, and shows info.
         */
        function exitNearestHubMode() {
          nearestHubModeActive = false;
          if (nearestMarker) {
            map.removeLayer(nearestMarker);
            nearestMarker = null;
          }
        }
        function showNearestHub(lat: number, lng: number) {
          exitNearestHubMode();

          const plonkIcon = L.divIcon({
            html: `
            <div style="display:flex;flex-direction:column;align-items:center;animation:lbdoo-plonk 1.5s ease-in-out infinite;">
              <div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:#ef4444;border:2px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,0.5);transform:rotate(-45deg);"></div>
              <div style="width:4px;height:10px;background:#ef4444;border-radius:0 0 3px 3px;margin-top:-2px;"></div>
            </div>`,
            className: "",
            iconSize: [22, 32],
            iconAnchor: [11, 32],
          });

          nearestMarker = L.marker([lat, lng], { icon: plonkIcon })
            .bindPopup(
              `<b>Your location</b><br>${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            )
            .addTo(map);

          const eligibleHubs = POINTS.filter(isEligibleDonorHub)
            .map((p) => ({
              point: p,
              distanceKm: haversineKm(lat, lng, p.lat, p.lng),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm);

          if (eligibleHubs.length === 0) {
            map.setView([lat, lng], 6);
            onNoEligibleHubsFoundRef.current?.();
            return;
          }

          const nearest = eligibleHubs[0];
          nearestHubModeActive = true;
          selectedPointId = nearest.point.id;
          activeISO = nearest.point.iso;

          const contextHubs = eligibleHubs.slice(0, 5).map((e) => e.point);
          const boundsPoints: [number, number][] = [
            [lat, lng],
            ...contextHubs.map((p) => [p.lat, p.lng] as [number, number]),
          ];
          map.fitBounds(L.latLngBounds(boundsPoints), {
            padding: [70, 70],
            maxZoom: 10,
          });

          buildMarkers();
          onViewChangeRef.current?.({
            kind: "nearestHub",
            id: nearest.point.id,
            distanceKm: Math.round(nearest.distanceKm),
          });
        }

        function focusHub(id: string) {
          const point = getPointById(id);
          if (!point) return;
          exitNearestHubMode();
          selectedPointId = id;
          activeISO = point.iso;
          map.setView([point.lat, point.lng], Math.max(map.getZoom(), 8));
          buildMarkers();
          onViewChangeRef.current?.({ kind: "hub", id });
        }

        // ─── Country styling ──────────────────────────────────────────────────────
        function countryStyle(feat: any) {
          const iso: string = feat.properties._iso;
          const d = DONORS[iso],
            r = RECEIVERS[iso];
          const z = map.getZoom();
          if (arrowInfoVisible) {
            return {
              fillColor: "#d4d4d4",
              fillOpacity: 0.06,
              color: "#bbb",
              weight: 0.4,
              opacity: 0.15,
            };
          }
          const faded = z >= 5 || activeISO !== null;
          let fill = "#d4d4d4";
          const opacity = faded ? 0.05 : 0.75;
          if (!faded) {
            if (d && !r) fill = donorFill(d.donations);
            else if (r && !d) fill = receiverFill(r.locations);
            else if (d && r)
              fill =
                d.donations / MAX_D >= r.locations / MAX_R
                  ? donorFill(d.donations)
                  : receiverFill(r.locations);
          }
          return {
            fillColor: fill,
            fillOpacity: opacity,
            color: "#999",
            weight: 0.5,
            opacity: faded ? 0.2 : 0.7,
          };
        }
        //Najia here the click on a donator/receiver is triggered, just delete the content of the function
        // ─── Marker cluster ───────────────────────────────────────────────────────
        function markerInfo(point: LocationPoint) {
          if (arrowInfoVisible) return;

          exitNearestHubMode();
          selectedPointId = point.id;
          activeISO = point.iso;
          map.setView([point.lat, point.lng], Math.min(map.getZoom() + 1, 8));
          buildMarkers();
          onViewChangeRef.current?.({ kind: "hub", id: point.id });
        }

        function buildMarkers() {
          if (clusterLayer) {
            map.removeLayer(clusterLayer);
            clusterLayer = null;
          }
          if (arrowInfoVisible) return;

          if (nearestHubModeActive) {
            buildNearestHubModeMarkers();
            return;
          }

          const z = map.getZoom();
          if (z < 4 && !activeISO) return;

          clusterLayer = new L.MarkerClusterGroup({
            maxClusterRadius: 55,
            disableClusteringAtZoom: 9,
            iconCreateFunction(cluster: any) {
              const n = cluster.getChildCount();
              const sz = n > 30 ? 50 : n > 10 ? 40 : 32;
              const bg = n > 30 ? "#EA580C" : "#2563EB";
              return L.divIcon({
                html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:${sz > 40 ? 14 : 12}px;font-weight:500;color:#fff;border:2px solid rgba(255,255,255,0.9);box-shadow:0 1px 5px rgba(0,0,0,0.3)">${n}</div>`,
                className: "",
                iconSize: [sz, sz],
                iconAnchor: [sz / 2, sz / 2],
              });
            },
          });

          const pts = POINTS;
          pts.forEach((p) => {
            const isSelected = p.id === selectedPointId;
            const c = p.type === "donor" ? "#2563EB" : "#EA580C";
            const size = isSelected ? 22 : 14;
            const ring = isSelected
              ? `border:3px solid #fff;box-shadow:0 0 0 3px ${c}, 0 1px 6px rgba(0,0,0,0.35);`
              : `border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);`;
            const icon = L.divIcon({
              html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${c};${ring}cursor:pointer"></div>`,
              className: "",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
            const marker = L.marker([p.lat, p.lng], { icon });
            marker.on("click", (e: any) => {
              L.DomEvent.stopPropagation(e);
              markerInfo(p);
            });
            marker.addTo(clusterLayer);
          });
          map.addLayer(clusterLayer);
        }

        function buildNearestHubModeMarkers() {
          const group = L.layerGroup();
          POINTS.filter((p) => p.type === "donor").forEach((p) => {
            const isSelected = p.id === selectedPointId;
            const eligible = isEligibleDonorHub(p);
            const color = isSelected
              ? "#2563EB"
              : eligible
                ? "#60A5FA"
                : "#A1A1AA";
            const size = isSelected ? 22 : 14;
            const ring = isSelected
              ? `border:3px solid #fff;box-shadow:0 0 0 3px ${color}, 0 1px 6px rgba(0,0,0,0.35);`
              : `border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);`;
            const opacity = isSelected || eligible ? 1 : 0.55;
            const icon = L.divIcon({
              html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};${ring}opacity:${opacity};cursor:pointer"></div>`,
              className: "",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
            const marker = L.marker([p.lat, p.lng], { icon });
            marker.on("click", (e: any) => {
              L.DomEvent.stopPropagation(e);
              markerInfo(p);
            });
            marker.addTo(group);
          });
          group.addTo(map);
          clusterLayer = group;
        }

        // ─── Legend ───────────────────────────────────────────────────────────────
        function updateLegend(z: number) {
          const el = document.getElementById("lbdoo-legend");
          if (!el) return;
          if (arrowInfoVisible) {
            el.innerHTML = "";
            return;
          }
          if (z >= 5) {
            el.innerHTML = `
            <div style="font-weight:500;font-size:13px;margin-bottom:6px">Location view</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:12px;height:12px;border-radius:50%;background:#2563EB;display:inline-block"></span> Donor hub</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:50%;background:#EA580C;display:inline-block"></span> Receiving center</div>`;
          } else {
            el.innerHTML = `
            <div style="font-weight:500;font-size:13px;margin-bottom:6px">Country view</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:14px;height:14px;border-radius:2px;background:#2563EB;display:inline-block;opacity:0.85"></span> Primarily donating</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:14px;height:14px;border-radius:2px;background:#EA580C;display:inline-block;opacity:0.85"></span> Primarily receiving</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:2px;background:#d4d4d4;border:0.5px solid #aaa;display:inline-block"></span> No data</div>`;
          }
        }

        // ─── Country info panel ───────────────────────────────────────────────────
        function showInfo(iso: string) {
          activeISO = iso;
          onViewChangeRef.current?.({ kind: "country", iso });
        }

        // ─── Auto-show country info when zoomed ──────────────────────────────────
        /**
         * At zoom ≥ 5, find the GeoJSON feature whose centroid is closest to the
         * map center and call showInfo for it, so the info panel updates as you pan.
         */
        function autoShowCenterCountry() {
          if (arrowInfoVisible || nearestHubModeActive) return;
          const z = map.getZoom();
          if (z < 5) return;

          const center = map.getCenter();
          let bestISO: string | null = null;
          let bestDist = Infinity;

          if (!geoLayer) return;
          geoLayer.eachLayer((layer: any) => {
            const iso: string | null = layer.feature?.properties?._iso;
            if (!iso) return;
            try {
              const bounds = layer.getBounds();
              const c = bounds.getCenter();
              const dLat = c.lat - center.lat;
              const dLng = c.lng - center.lng;
              const dist = dLat * dLat + dLng * dLng;
              if (dist < bestDist) {
                bestDist = dist;
                bestISO = iso;
              }
            } catch {}
          });

          if (bestISO && bestISO !== activeISO) {
            activeISO = bestISO;
            showInfo(bestISO);
          }
        }

        function refresh() {
          if (geoLayer) geoLayer.setStyle((f: any) => countryStyle(f));
          buildMarkers();
          updateLegend(map.getZoom());
          if (!arrowInfoVisible) autoShowCenterCountry();
        }
        function resetToWorldView() {
          if (arrowInfoVisible) clearArrow();
          exitNearestHubMode();
          activeISO = null;
          selectedPointId = null;
          map.setView([20, 10], 2);
          refresh();
        }

        function focusCountry(iso: string) {
          if (arrowInfoVisible) clearArrow();
          exitNearestHubMode();
          selectedPointId = null;
          activeISO = iso;
          if (geoLayer) {
            geoLayer.eachLayer((layer: any) => {
              if (layer.feature?.properties?._iso === iso) {
                map.fitBounds(layer.getBounds(), {
                  padding: [40, 40],
                  maxZoom: 8,
                });
              }
            });
          }
          refresh();
          onViewChangeRef.current?.({ kind: "country", iso });
        }

        function showDeviceJourney(serial: string) {
          const journey = getDeviceJourney(serial);
          if (!journey) return;

          exitNearestHubMode();
          selectedPointId = null;

          if (journey.village) {
            activeISO = journey.village.iso;
            drawDonationArrow(
              {
                lat: journey.hub.lat,
                lng: journey.hub.lng,
                label: journey.hub.label,
                count: journey.hub.count,
              },
              {
                lat: journey.village.lat,
                lng: journey.village.lng,
                label: journey.village.label,
                count: journey.village.count,
              },
            );
            const bounds = L.latLngBounds([
              [journey.hub.lat, journey.hub.lng],
              [journey.village.lat, journey.village.lng],
            ]);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 });
          } else {
            if (arrowInfoVisible) clearArrow();
            activeISO = journey.hub.iso;
            selectedPointId = journey.hub.id;
            map.setView(
              [journey.hub.lat, journey.hub.lng],
              Math.max(map.getZoom(), 8),
            );
            refresh();
          }
        }

        actionsRef.current = {
          resetToWorldView,
          focusCountry,
          showNearestHub,
          focusHub,
          showDeviceJourney,
        };

        // ─── Load world data ──────────────────────────────────────────────────────
        try {
          const resp = await fetch(
            "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
          );
          const topo = await resp.json();
          let geojson = topojson.feature(topo, topo.objects.countries);

          // Remove Antarctica, unrecognised artefacts, and antimeridian-crossing features
          geojson.features = geojson.features.filter((f: any) => {
            const id = String(f.id);
            return !SKIP_IDS.has(id) && f.id !== undefined && f.id !== null;
          });
          geojson = stripAntimeridianArtifacts(geojson);

          geojson.features.forEach((f: any) => {
            f.properties._iso = NUM_TO_ISO[String(f.id)] ?? null;
          });

          geoLayer = L.geoJSON(geojson, {
            style: (f: any) => countryStyle(f),
            onEachFeature(feat: any, layer: any) {
              const iso: string = feat.properties._iso;
              layer.on({
                mouseover() {
                  if (
                    !arrowInfoVisible &&
                    map.getZoom() < 5 &&
                    (DONORS[iso] || RECEIVERS[iso])
                  )
                    layer.setStyle({ weight: 1.5, color: "#444" });
                },
                mouseout() {
                  geoLayer?.resetStyle(layer);
                },
                click(e: any) {
                  L.DomEvent.stopPropagation(e);
                  if (!iso || arrowInfoVisible) return;
                  exitNearestHubMode();
                  selectedPointId = null;
                  activeISO = iso;
                  showInfo(iso);
                  map.fitBounds(layer.getBounds(), {
                    padding: [40, 40],
                    maxZoom: 8,
                  });
                  refresh();
                },
              });
            },
          }).addTo(map);

          const statusEl = document.getElementById("lbdoo-status");
          if (statusEl) statusEl.style.display = "none";
          buildMarkers();
          updateLegend(map.getZoom());
        } catch (err) {
          console.error("Map load error:", err);
          const statusEl = document.getElementById("lbdoo-status");
          if (statusEl)
            statusEl.textContent = "Failed to load map data. Please reload.";
        }

        map.on("zoom", () => {
          if (arrowInfoVisible && currentArrowParams) {
            renderArrowOverlay(
              currentArrowParams.donor,
              currentArrowParams.receiver,
            );
          }
        });

        map.on("move", () => {
          if (arrowInfoVisible && currentArrowParams) {
            renderArrowOverlay(
              currentArrowParams.donor,
              currentArrowParams.receiver,
            );
          }
        });

        map.on("moveend", () => {
          if (!arrowInfoVisible) {
            autoShowCenterCountry();
          }
        });

        map.on("zoomend", () => {
          if (arrowInfoVisible) {
            refresh();
            return;
          }
          const z = map.getZoom();
          if (z < 5) {
            exitNearestHubMode();
            activeISO = null;
            selectedPointId = null;
            onViewChangeRef.current?.({ kind: "world" });
          }
          refresh();
        });

        map.on("click", () => {
          if (arrowInfoVisible) return;
          exitNearestHubMode();
          activeISO = null;
          selectedPointId = null;
          refresh();
          onViewChangeRef.current?.({ kind: "world" });
        });
      };

      init();
    }, []);

    return (
      <div className="relative w-full h-full overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        <div
          id="lbdoo-status"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-5 py-3 text-sm text-zinc-500"
        >
          Loading map data…
        </div>

        <div
          id="lbdoo-legend"
          className="absolute bottom-6 left-3 z-[1000] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 pointer-events-none"
        />
      </div>
    );
  },
);

export default LabdooMap;
