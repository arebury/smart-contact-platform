import { Outlet, useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Construction } from "lucide-react";
import { popUndo } from "../shared/undoStack";
import { toast } from "sonner";

function ErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <>
      <TopBar breadcrumbs={[{ label: is404 ? "No encontrado" : "Error" }]} />
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-5">
          <div className="border border-dashed border-gray-300 bg-white py-20 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border border-dashed border-gray-300 flex items-center justify-center">
              <Construction size={24} className="text-gray-300" />
            </div>
            <div className="text-center">
              <div
                className="text-[13px] text-gray-500"
                style={{ fontWeight: 500 }}
              >
                {is404 ? "Sección en construcción" : "Algo salió mal"}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {is404
                  ? "Esta página aún no está disponible"
                  : "Se produjo un error inesperado"}
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-3 py-1 text-[11px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppLayout() {
  /* Global Ctrl+Z undo (DD#293) */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only fire when not inside an input/textarea/contenteditable
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const result = popUndo();
        if (result.executed) {
          if (result.toastId) toast.dismiss(result.toastId);
          toast("Cambio revertido", {
            description: result.description,
            duration: 3000,
          });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export function AppLayoutError() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ErrorFallback />
      </div>
    </div>
  );
}