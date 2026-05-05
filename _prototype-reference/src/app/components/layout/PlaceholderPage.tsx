import { useLocation } from "react-router";
import { TopBar } from "./TopBar";
import { Construction } from "lucide-react";

export function PlaceholderPage() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const title = segments.length > 0
    ? segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")).join(" — ")
    : "Página";

  return (
    <>
      <TopBar
        breadcrumbs={segments.map((s) => ({
          label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "),
        }))}
      />
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-6">
          <div className="border border-dashed border-gray-300 py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 border border-dashed border-gray-300 flex items-center justify-center">
              <Construction size={24} className="text-gray-300" />
            </div>
            <div className="text-center">
              <div
                className="text-[13px] text-gray-500"
                style={{ fontWeight: 500 }}
              >
                {title}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Sección en construcción
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
