import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WorkOrderListPage } from "@/pages/WorkOrderListPage";
import { WorkOrderFormPage } from "@/pages/WorkOrderFormPage";
import type { RepairStatus } from "@/types/workOrder";

export function App() {
  const [statusFilter, setStatusFilter] = useState<RepairStatus | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <WorkOrderListPage
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              }
            />
            <Route path="/new" element={<WorkOrderFormPage />} />
            <Route path="/edit/:id" element={<WorkOrderFormPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
