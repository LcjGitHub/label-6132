import { useState } from "react";
import { BrowserRouter, Route, Routes, NavLink } from "react-router-dom";
import { WorkOrderListPage } from "@/pages/WorkOrderListPage";
import { WorkOrderFormPage } from "@/pages/WorkOrderFormPage";
import { CityDashboardPage } from "@/pages/CityDashboardPage";
import type { RepairStatus } from "@/types/workOrder";

export function App() {
  const [statusFilter, setStatusFilter] = useState<RepairStatus | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <nav className="mb-8">
            <div className="flex gap-2 border-b border-border pb-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                工单管理
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                城市看板
              </NavLink>
            </div>
          </nav>

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
            <Route path="/dashboard" element={<CityDashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
