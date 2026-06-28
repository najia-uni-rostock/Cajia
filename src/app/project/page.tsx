"use client";

import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";

const LabdooMap = dynamic(() => import("./LabdooMap"), { ssr: false });

export default function Project() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative h-full">
        <LabdooMap />
      </div>
    </div>
  );
}
