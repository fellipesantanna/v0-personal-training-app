"use client";

import { Suspense } from "react";
import SessionPageContent from "./session-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando sessão...</div>}>
      <SessionPageContent />
    </Suspense>
  );
}