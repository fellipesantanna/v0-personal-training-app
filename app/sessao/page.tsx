"use client";

import { Suspense } from "react";
import SessionPageContent from "./session-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando sessão...</div>}>
      <SessionPageContent />
    </Suspense>
  );
}