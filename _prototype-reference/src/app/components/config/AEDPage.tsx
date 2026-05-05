import { useState, useMemo } from "react";
import { TopBar } from "../layout/TopBar";
import { countryPrefixes, type CountryPrefix } from "../agents/countryPrefixes";
import { toast } from "sonner";
import {
  Search,
  X,
  Hash,
  Save,
  Info,
} from "lucide-react";

/**
 * AED Configuration page — Configuración > AED
 * Contains the "Numeración especial" country-prefix picker.
 */
export function AEDPage() {
  /* ── State ── */
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return countryPrefixes;
    return countryPrefixes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.prefix.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    setDirty(true);
  };

  const removeCode = (code: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
    setDirty(true);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      toast.success(
        `Numeración especial guardada (${selectedCodes.length} ${selectedCodes.length === 1 ? "país" : "países"})`
      );
    }, 600);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Configuración" },
          { label: "AED" },
        ]}
      />

      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-6 max-w-[820px]">

          {/* ── Page header ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                <Hash size={16} className="text-gray-500" />
              </div>
              <div>
                <h1
                  className="text-[16px] text-gray-800"
                  style={{ fontWeight: 600 }}
                >
                  Configuración AED
                </h1>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Parámetros globales del distribuidor automático
                </p>
              </div>
            </div>
          </div>

          {/* ── Numeración especial card ── */}
          <div className="border border-gray-200 bg-white">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-gray-400" />
                <span
                  className="text-[13px] text-gray-700"
                  style={{ fontWeight: 600 }}
                >
                  Numeración especial
                </span>
                <span className="text-[11px] text-gray-400 ml-1">
                  Prefijos internacionales permitidos
                </span>
              </div>
              {/* selection count removed — avoid badge counters */}
            </div>

            <div className="px-5 py-5">
              {/* Hint */}
              <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-gray-50 border border-gray-200">
                <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-gray-500">
                  Selecciona los prefijos de los países a los que se permite marcar como numeración especial.
                  Todos los prefijos están desactivados por defecto.
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar país, prefijo o código ISO..."
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

              {/* Country list */}
              <div className="border border-gray-200 overflow-hidden max-h-[380px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-3 py-8 text-[12px] text-gray-400 text-center">
                    No se encontraron países para "{search}"
                  </div>
                ) : (
                  filtered.map((country, idx) => {
                    const isChecked = selectedCodes.includes(country.code);
                    return (
                      <div
                        key={country.code}
                        className={`group/row flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                          idx < filtered.length - 1 ? "border-b border-gray-100" : ""
                        } ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                        onClick={() => toggleCode(country.code)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${
                            isChecked ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                          }`}
                          tabIndex={-1}
                        />
                        <span className="text-[17px] leading-none select-none w-6 text-center">
                          {country.flag}
                        </span>
                        <span
                          className="text-[13px] text-gray-600 flex-1"
                          style={{ fontWeight: isChecked ? 500 : 400 }}
                        >
                          {country.name}
                        </span>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider w-6 text-center">
                          {country.code}
                        </span>
                        <span className="text-[12px] text-gray-400 tabular-nums w-14 text-right">
                          {country.prefix}
                        </span>
                        {isChecked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCode(country.code);
                            }}
                            className="text-gray-300 hover:text-gray-500 cursor-pointer shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected chips feedback */}
              {selectedCodes.length > 0 && (
                <div className="mt-4">
                  <span
                    className="text-[12px] text-gray-500 block mb-2"
                    style={{ fontWeight: 500 }}
                  >
                    Prefijos habilitados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCodes.map((code) => {
                      const country = countryPrefixes.find((c) => c.code === code);
                      if (!country) return null;
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 text-[12px] text-gray-600 bg-white"
                          style={{ fontWeight: 500 }}
                        >
                          <span className="text-[14px] leading-none">{country.flag}</span>
                          <span className="text-gray-500">{country.name}</span>
                          <span className="text-gray-400">{country.prefix}</span>
                          <button
                            type="button"
                            onClick={() => removeCode(code)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer ml-0.5"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Save bar */}
            {dirty && (
              <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCodes([]);
                    setDirty(false);
                  }}
                  className="px-4 py-2 text-[13px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
                  style={{ fontWeight: 500 }}
                >
                  <Save size={14} />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
