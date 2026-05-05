import { useState, useMemo } from "react";
import { TopBar } from "../layout/TopBar";
import { useAgentsStore } from "../agents/useAgentsStore";
import { toast } from "sonner";
import {
  Shield,
  Key,
  Search,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Check,
  Loader2,
  Info,
} from "lucide-react";

/**
 * Seguridad page — Configuración > Seguridad
 * Contains the "Regeneración masiva de contraseñas" feature, intentionally
 * buried inside an accordion so it's not triggered accidentally.
 */
export function SeguridadPage() {
  const { agents } = useAgentsStore();

  /* ── Accordion state — collapsed by default, very intentional ── */
  const [regenOpen, setRegenOpen] = useState(false);

  /* ── Selection state ── */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ count: number; ts: string } | null>(null);

  const activeAgents = useMemo(
    () => agents.filter((a) => a.status === "active"),
    [agents]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return activeAgents;
    return activeAgents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.includes(q) ||
        a.extension.includes(q) ||
        (a.email && a.email.toLowerCase().includes(q))
    );
  }, [activeAgents, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filtered.forEach((a) => next.delete(a.id));
    } else {
      filtered.forEach((a) => next.add(a.id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const CONFIRM_TEXT = "REGENERAR";
  const canExecute = selectedIds.size > 0 && confirmPhrase === CONFIRM_TEXT && !processing;

  const handleRegenerate = () => {
    if (!canExecute) return;
    setProcessing(true);
    setTimeout(() => {
      const count = selectedIds.size;
      const now = new Date();
      const ts = now.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setResult({ count, ts });
      setProcessing(false);
      setSelectedIds(new Set());
      setConfirmPhrase("");
      toast.success(
        `Se regeneraron ${count} contraseña${count !== 1 ? "s" : ""}. Descarga el archivo con las credenciales temporales.`
      );
    }, 1500);
  };

  const handleDownload = () => {
    // Simulated CSV download of temporary credentials
    const selectedAgents = agents.filter((a) => selectedIds.has(a.id) || (result && result.count > 0));
    const header = "Código,Nombre,Email,Contraseña temporal";
    const rows = (result ? agents.slice(0, result.count) : agents.filter((a) => selectedIds.has(a.id)))
      .map((a) => {
        const tempPwd = `tmp_${Math.random().toString(36).slice(2, 10)}`;
        return `${a.code},"${a.name}",${a.email || ""},${tempPwd}`;
      });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credenciales_temporales_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo CSV descargado");
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Configuración" },
          { label: "Seguridad" },
        ]}
      />

      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-6 max-w-[820px]">

          {/* ── Page header ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                <Shield size={16} className="text-gray-500" />
              </div>
              <div>
                <h1
                  className="text-[16px] text-gray-800"
                  style={{ fontWeight: 600 }}
                >
                  Seguridad
                </h1>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Políticas de seguridad y credenciales de la plataforma
                </p>
              </div>
            </div>
          </div>

          {/* ── Placeholder settings before the dangerous zone ── */}
          <div className="border border-gray-200 bg-white mb-6">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <span className="text-[13px] text-gray-700" style={{ fontWeight: 600 }}>
                Políticas de contraseñas
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-[13px] text-gray-600" style={{ fontWeight: 500 }}>
                    Longitud mínima
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Número mínimo de caracteres requeridos
                  </p>
                </div>
                <select className="px-3 py-1.5 border border-gray-300 text-[13px] bg-white cursor-pointer focus:outline-none focus:border-gray-500">
                  <option>8 caracteres</option>
                  <option>10 caracteres</option>
                  <option>12 caracteres</option>
                  <option>16 caracteres</option>
                </select>
              </div>
              <div className="border-t border-gray-100 flex items-center justify-between py-3">
                <div>
                  <span className="text-[13px] text-gray-600" style={{ fontWeight: 500 }}>
                    Expiración de contraseñas
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Tiempo tras el cual las contraseñas caducan
                  </p>
                </div>
                <select className="px-3 py-1.5 border border-gray-300 text-[13px] bg-white cursor-pointer focus:outline-none focus:border-gray-500">
                  <option>Sin expiración</option>
                  <option>30 días</option>
                  <option>60 días</option>
                  <option>90 días</option>
                </select>
              </div>
              <div className="border-t border-gray-100 flex items-center justify-between py-3">
                <div>
                  <span className="text-[13px] text-gray-600" style={{ fontWeight: 500 }}>
                    Caracteres especiales obligatorios
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Requiere al menos un carácter no alfanumérico
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </div>

          {/* ── Regeneración masiva — hidden accordion ── */}
          <div className="border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setRegenOpen(!regenOpen)}
              className="w-full px-5 py-4 flex items-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
            >
              {regenOpen ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
              <Key size={14} className="text-gray-400" />
              <span
                className="text-[13px] text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Regeneración de contraseñas
              </span>
              {!regenOpen && (
                <span className="text-[11px] text-gray-400 ml-2">
                  (acción administrativa avanzada)
                </span>
              )}
            </button>

            {regenOpen && (
              <div className="px-5 py-5">
                {/* Warning */}
                <div className="flex items-start gap-2.5 mb-5 px-4 py-3 bg-amber-50 border border-amber-200">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span
                      className="text-[13px] text-amber-700 block"
                      style={{ fontWeight: 600 }}
                    >
                      Acción irreversible
                    </span>
                    <p className="text-[12px] text-amber-600 mt-1">
                      Regenerar las contraseñas invalida inmediatamente las credenciales actuales de los agentes
                      seleccionados. Cada agente deberá usar la contraseña temporal proporcionada en el archivo
                      de descarga para volver a acceder y establecer una nueva contraseña.
                    </p>
                  </div>
                </div>

                {/* Use-case hint */}
                <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-gray-50 border border-gray-200">
                  <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-gray-500">
                    Utiliza esta herramienta para recuperar acceso de agentes que han olvidado su contraseña,
                    o ante un incidente de seguridad (ciberataque) que requiera la invalidación masiva de credenciales.
                    Puedes seleccionar agentes individuales o usar "Seleccionar todos" para un reset global.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar agente por nombre, código, extensión o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Agent list */}
                <div className="border border-gray-200 overflow-hidden max-h-[320px] overflow-y-auto mb-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      {selectedIds.size > 0
                        ? `${selectedIds.size} seleccionado${selectedIds.size !== 1 ? "s" : ""}`
                        : `${activeAgents.length} agentes activos`}
                    </span>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="px-3 py-6 text-[12px] text-gray-400 text-center">
                      Sin resultados
                    </div>
                  ) : (
                    filtered.map((agent, idx) => {
                      const isChecked = selectedIds.has(agent.id);
                      return (
                        <div
                          key={agent.id}
                          className={`group/arow flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                            idx < filtered.length - 1 ? "border-b border-gray-100" : ""
                          } ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                          onClick={() => toggleOne(agent.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${
                              isChecked ? "opacity-100" : "opacity-0 group-hover/arow:opacity-100"
                            }`}
                            tabIndex={-1}
                          />
                          <span className="text-[12px] text-gray-400 tabular-nums w-12">
                            {agent.code}
                          </span>
                          <span
                            className="text-[13px] text-gray-600 flex-1"
                            style={{ fontWeight: isChecked ? 500 : 400 }}
                          >
                            {agent.name}
                          </span>
                          <span className="text-[12px] text-gray-400 w-10 text-right">
                            ext. {agent.extension}
                          </span>
                          {agent.email && (
                            <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
                              {agent.email}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Confirmation zone */}
                {selectedIds.size > 0 && (
                  <div className="border border-red-200 bg-red-50/40 px-4 py-4">
                    <span
                      className="text-[13px] text-gray-700 block mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      Confirmar regeneración
                    </span>
                    <p className="text-[12px] text-gray-500 mb-3">
                      Escribe <span className="text-red-500" style={{ fontWeight: 600 }}>
                        {CONFIRM_TEXT}
                      </span> para confirmar la acción sobre{" "}
                      <span style={{ fontWeight: 600 }}>
                        {selectedIds.size} agente{selectedIds.size !== 1 ? "s" : ""}
                      </span>.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={confirmPhrase}
                        onChange={(e) => setConfirmPhrase(e.target.value.toUpperCase())}
                        placeholder={`Escribe ${CONFIRM_TEXT}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-red-400 bg-white"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={!canExecute}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                        style={{ fontWeight: 500 }}
                      >
                        {processing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Key size={14} />
                            Regenerar contraseñas
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Result / Download */}
                {result && (
                  <div className="mt-4 border border-green-200 bg-green-50/50 px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check size={15} className="text-green-600" />
                      <div>
                        <span className="text-[13px] text-green-700" style={{ fontWeight: 500 }}>
                          {result.count} contraseña{result.count !== 1 ? "s" : ""} regenerada{result.count !== 1 ? "s" : ""}
                        </span>
                        <p className="text-[11px] text-green-600">
                          {result.ts}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                      style={{ fontWeight: 500 }}
                    >
                      <Download size={14} />
                      Descargar CSV
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}