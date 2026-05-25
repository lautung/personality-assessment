"use client";

import dynamic from "next/dynamic";

const AssessmentApp = dynamic(() => import("../src/App.jsx"), { ssr: false });

export default function ClientApp() {
  return <AssessmentApp />;
}
