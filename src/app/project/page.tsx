"use client";

import dynamic from "next/dynamic";

const LabdooMap = dynamic(() => import("./LabdooMap"), { ssr: false });

export default function Project() {
  return <LabdooMap />;
}
