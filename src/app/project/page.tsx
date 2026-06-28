"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import type { MapView } from "./types";
import type { LabdooMapHandle } from "./LabdooMap";

const LabdooMap = dynamic(() => import("./LabdooMap"), { ssr: false });

export default function Project() {
  const [view, setView] = useState<MapView>({ kind: "world" });
  const mapHandleRef = useRef<LabdooMapHandle>(null);

  const handleViewChange = useCallback((next: MapView) => {
    setView(next);
  }, []);

  const handleBackToWorld = useCallback(() => {
    mapHandleRef.current?.resetToWorldView();
    setView({ kind: "world" });
  }, []);

  const handleBackToCountry = useCallback((iso: string) => {
    mapHandleRef.current?.focusCountry(iso);
    setView({ kind: "country", iso });
  }, []);

  const handleShowNearestHub = useCallback(() => {
    // TODO (S5): request geolocation permission, then call
    // mapHandleRef.current?.showNearestHub(lat, lng) once that map action exists
    console.log("TODO (S5): show nearest hub — geolocation not wired up yet");
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        view={view}
        onBackToWorld={handleBackToWorld}
        onBackToCountry={handleBackToCountry}
        onShowNearestHub={handleShowNearestHub}
      />
      <div className="flex-1 relative h-full">
        <LabdooMap ref={mapHandleRef} onViewChange={handleViewChange} />
      </div>
    </div>
  );
}
