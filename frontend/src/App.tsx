import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignListPage } from "@/pages/SignListPage";
import { SignFormPage } from "@/pages/SignFormPage";
import type { NeonStatus } from "@/types/neon";

export function App() {
  const [statusFilter, setStatusFilter] = useState<NeonStatus | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <SignListPage
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              }
            />
            <Route path="/new" element={<SignFormPage />} />
            <Route path="/edit/:id" element={<SignFormPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
