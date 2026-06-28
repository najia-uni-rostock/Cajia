"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import type { MapView } from "./types";
import type { LabdooMapHandle } from "./LabdooMap";
import SearchOverlay from "./SearchOverlay";

const LabdooMap = dynamic(() => import("./LabdooMap"), { ssr: false });

export default function Project() {
  const [view, setView] = useState<MapView>({ kind: "world" });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocatingNearestHub, setIsLocatingNearestHub] = useState(false);
  const mapHandleRef = useRef<LabdooMapHandle>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleViewHubDetails = useCallback((id: string) => {
    mapHandleRef.current?.focusHub(id);
    setView({ kind: "hub", id });
  }, []);

  const handleShowNearestHub = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationError(null);
    setIsLocatingNearestHub(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapHandleRef.current?.showNearestHub(latitude, longitude);
        setIsLocatingNearestHub(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Couldn't determine your location.",
        );
        setIsLocatingNearestHub(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, []);

  const handleNoEligibleHubsFound = useCallback(() => {
    setLocationError("No donor hubs are currently accepting devices nearby.");
  }, []);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelectDevice = useCallback((serial: string) => {
    mapHandleRef.current?.showDeviceJourney(serial);
    setView({ kind: "deviceJourney", serial });
    setIsSearchOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        view={view}
        onBackToWorld={handleBackToWorld}
        onBackToCountry={handleBackToCountry}
        onShowNearestHub={handleShowNearestHub}
        onViewHubDetails={handleViewHubDetails}
        onOpenSearch={handleOpenSearch}
        locationError={locationError}
        isLocatingNearestHub={isLocatingNearestHub}
      />
      <div className="flex-1 relative h-full">
        <LabdooMap
          ref={mapHandleRef}
          onViewChange={handleViewChange}
          onNoEligibleHubsFound={handleNoEligibleHubsFound}
        />
        {isSearchOpen && (
          <SearchOverlay
            onClose={handleCloseSearch}
            onSelectDevice={handleSelectDevice}
          />
        )}
      </div>
    </div>
  );
}
