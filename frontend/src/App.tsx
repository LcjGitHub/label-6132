import { useState } from "react";
import { BrowserRouter, Route, Routes, NavLink } from "react-router-dom";
import { WorkOrderListPage } from "@/pages/WorkOrderListPage";
import { WorkOrderFormPage } from "@/pages/WorkOrderFormPage";
import { CityDashboardPage } from "@/pages/CityDashboardPage";
import { PhotographerListPage } from "@/pages/PhotographerListPage";
import { PhotographerFormPage } from "@/pages/PhotographerFormPage";
import { StoryListPage } from "@/pages/StoryListPage";
import { StoryFormPage } from "@/pages/StoryFormPage";
import { MaterialListPage } from "@/pages/MaterialListPage";
import { MaterialFormPage } from "@/pages/MaterialFormPage";
import { SignListPage } from "@/pages/SignListPage";
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
              <NavLink
                to="/photographers"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                拍摄者档案
              </NavLink>
              <NavLink
                to="/stories"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                故事专栏
              </NavLink>
              <NavLink
                to="/materials"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                材质登记
              </NavLink>
              <NavLink
                to="/signs"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                招牌档案
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
            <Route path="/photographers" element={<PhotographerListPage />} />
            <Route path="/photographers/new" element={<PhotographerFormPage />} />
            <Route path="/photographers/edit/:id" element={<PhotographerFormPage />} />
            <Route path="/stories" element={<StoryListPage />} />
            <Route path="/stories/new" element={<StoryFormPage />} />
            <Route path="/stories/edit/:id" element={<StoryFormPage />} />
            <Route path="/materials" element={<MaterialListPage />} />
            <Route path="/materials/new" element={<MaterialFormPage />} />
            <Route path="/materials/edit/:id" element={<MaterialFormPage />} />
            <Route path="/signs" element={<SignListPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
