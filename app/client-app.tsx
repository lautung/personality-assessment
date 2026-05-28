"use client";

import dynamic from "next/dynamic";

const AssessmentApp = dynamic(() => import("../src/App.tsx"), { ssr: false });

export default function ClientApp() {
  return <AssessmentApp />;
}
