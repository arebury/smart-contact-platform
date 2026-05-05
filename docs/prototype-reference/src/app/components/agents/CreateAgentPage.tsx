import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  availableGroups,
  availableExtensions,
  defaultPermissions,
  availableSchedules,
  type Agent,
  type AgentGroup,
  type AgentPermissions,
} from "./agentsData";
import { useTemplatesStore } from "../templates/useTemplatesStore";
import { useNavigate, useParams } from "react-router";
import { useNavigationGuard } from "../shared/useNavigationGuard";
import { TopBar } from "../layout/TopBar";
import { useAgentsStore } from "./useAgentsStore";
import {
  SectionCard,
  FieldLabel as FieldLabelBase,
  TooltipIcon as TooltipIconBase,
  DiscardDialog,
  ToggleSwitch,
  inputClass,
} from "../shared/FormComponents";
import { channelIconMap } from "../shared/TableComponents";
import { useClickOutside } from "../shared/useClickOutside";
import { useCrossTabWarning } from "../shared/useCrossTabWarning";
import { useLabelsStore } from "../labels/useLabelsStore";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { StickyFormHeader } from "../shared/StickyFormHeader";
import { LabelChip } from "../labels/LabelsPage";
import { LABEL_COLORS, labelColorStyles, type LabelColor } from "../labels/labelsData";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Users,
  Plus,
  Loader2,
  Trash2,
  Key,
  User,
  Camera,
  Shield,
  PhoneCall,
  Settings,
  Fingerprint,
  FileStack,
  Mail,
  MessageSquare,
  Pencil,
  Check,
  Tag,
  SlidersHorizontal,
  Plug,
  Globe,
  LogIn,
  Phone,
  FilePen,
} from "lucide-react";

/* ───── Tooltip data ───── */
const tooltips: Record<string, string> = {
  phone: "Número de teléfono directo del agente. No es la extensión",
  email: "Se usa para notificaciones y recuperación de contraseña",
  pin: "PIN numérico del agente para autenticación telefónica",
  extensionType:
    "Teléfono usa una línea física. WebRTC funciona directamente desde el navegador",
  agentType:
    "Normal usa softphone instalado. Cuscare y Cuscare Carrier funcionan desde el navegador. Admin Cuscare tiene permisos de administración",
  channels: "Canales que este agente puede atender",
  manageDevices:
    "El agente puede configurar su propio dispositivo de audio desde su panel",
  selfActivate:
    "El agente puede elegir en qué grupos está activo/inactivo desde su panel",
  externalDevices:
    "Permite usar dispositivos de audio externos como auriculares USB o Bluetooth",
  recording:
    "Graba automáticamente las llamadas de este agente",
  defaultOutbound:
    "Grupo que se usa por defecto cuando el agente realiza una llamada saliente",
  languages:
    "Idiomas que domina el agente para el enrutamiento por idioma",
  iframe:
    "URL que se carga en un iframe dentro del panel del agente",
  randomOrder:
    "Muestra el listado de agentes en orden aleatorio. Útil con muchos agentes",
  pickupType:
    "Automático descuelga sin intervención. Manual requiere que el agente acepte",
  pickupTypeChat:
    "Automático asigna el chat directamente. Manual requiere que el agente acepte la conversación",
  loginExtOverride:
    "Al hacer login telefónico, se modificará el teléfono desde el que se llama",
  maxChats:
    "Número máximo de conversaciones de chat que el agente puede atender simultáneamente",
};

/* Local wrappers: pre-bind the tooltips dict */
function FieldLabel({ text, required, tooltipKey }: { text: string; required?: boolean; tooltipKey?: string }) {
  return <FieldLabelBase text={text} required={required} tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}
function TooltipIcon({ tooltipKey }: { tooltipKey: string }) {
  return <TooltipIconBase tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}

/* ───── Extension Combobox (Patch H / DD#275) ───── */
const MAX_SHOW = 20;
function ExtensionCombobox({
  value,
  onChange,
  extensionType,
  allAgents,
  currentAgentId,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  extensionType: "phone" | "webrtc";
  allAgents: Agent[];
  currentAgentId?: number;
  error?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Keep query in sync when value changes externally (e.g. edit form load) */
  useEffect(() => { setQuery(value); }, [value]);

  /* Free extensions — exclude occupied ones entirely */
  const freeExts = useMemo(() => {
    const occupiedSet = new Set(
      allAgents
        .filter((a) => a.id !== currentAgentId)
        .map((a) => a.extension)
    );
    return availableExtensions
      .filter((ext) => ext.type === extensionType && !occupiedSet.has(ext.number))
      .map((ext) => ext.number)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [extensionType, allAgents, currentAgentId]);

  /* Filtered by query */
  const filtered = useMemo(() => {
    if (!query.trim()) return freeExts;
    return freeExts.filter((n) => n.startsWith(query.trim()));
  }, [freeExts, query]);

  const shown = filtered.slice(0, MAX_SHOW);

  /* Close on outside click */
  const closeDropdown = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  /* Validation on blur */
  const handleBlur = () => {
    setTimeout(() => {
      if (ref.current?.contains(document.activeElement)) return;
      setOpen(false);
      if (query && !freeExts.includes(query)) {
        /* typed value isn't a valid free extension — clear */
        onChange("");
        setQuery("");
      }
    }, 150);
  };

  const selectExt = (num: string) => {
    onChange(num);
    setQuery(num);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={ref}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={query}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "");
          setQuery(v);
          if (!open) setOpen(true);
          /* If exact match, auto-select */
          if (freeExts.includes(v)) {
            onChange(v);
          } else {
            onChange("");
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
          if (e.key === "Enter" && shown.length === 1) { e.preventDefault(); selectExt(shown[0]); }
        }}
        placeholder="Escribir extensión..."
        className={`${inputClass} pr-8${error ? " border-red-400" : ""}`}
        autoComplete="off"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => { if (open) { setOpen(false); } else { setOpen(true); inputRef.current?.focus(); } }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label="Mostrar extensiones"
      >
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-50 max-h-[280px] overflow-y-auto">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 text-[11px] text-gray-400" style={{ fontWeight: 500 }}>
            {query.trim()
              ? `Resultados para «${query}»`
              : "Extensiones disponibles"}
          </div>
          {shown.length === 0 ? (
            <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
              {query.trim()
                ? `No hay extensiones disponibles que empiecen por «${query}»`
                : "No hay extensiones disponibles para este tipo"}
            </div>
          ) : (
            <>
              {shown.map((num) => (
                <button
                  key={num}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectExt(num); }}
                  className={`w-full text-left px-3 py-2 text-[13px] font-mono cursor-pointer hover:bg-gray-50 ${
                    num === value ? "bg-gray-50 text-gray-800" : "text-gray-600"
                  }`}
                >
                  {num}
                </button>
              ))}
              {filtered.length > MAX_SHOW && (
                <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400 text-center">
                  Mostrando {MAX_SHOW} de {filtered.length} · Escribe para filtrar
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function CreateAgentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addAgent, updateAgent, deleteAgent, getAgent, agents: allAgentsFromStore } =
    useAgentsStore();
  const { templates: availableTemplates } = useTemplatesStore();

  /* ── Load existing agent data ── */
  const existingAgent = useMemo(
    () => (id ? getAgent(Number(id)) : undefined),
    [id, getAgent]
  );
  const crossTabConflict = useCrossTabWarning("agent", existingAgent?.id);

  /* ── Form state ── */
  const [name, setName] = useState(existingAgent?.name || "");
  const [agentPhone, setAgentPhone] = useState(existingAgent?.phone || "");
  const [agentEmail, setAgentEmail] = useState(existingAgent?.email || "");
  const [extensionType, setExtensionType] = useState<"phone" | "webrtc">(
    existingAgent?.extensionType || "webrtc"
  );
  const [extension, setExtension] = useState(existingAgent?.extension || "");
  const [agentType, setAgentType] = useState<"normal" | "cuscare" | "cuscare_carrier" | "admin_cuscare">(
    existingAgent?.agentType || "cuscare"
  );
  const [channels, setChannels] = useState<Record<string, boolean>>({
    phone: existingAgent?.channels.includes("phone") ?? true,
    chat: existingAgent?.channels.includes("chat") ?? false,
    email: existingAgent?.channels.includes("email") ?? false,
  });
  const [maxChats, setMaxChats] = useState(existingAgent?.maxChats ?? 1);

  /* Permissions */
  const [permissions, setPermissions] = useState<AgentPermissions>(
    existingAgent?.permissions
      ? { ...defaultPermissions, ...existingAgent.permissions }
      : { ...defaultPermissions }
  );

  /* Groups */
  const [assignedGroups, setAssignedGroups] = useState<AgentGroup[]>(
    existingAgent?.groups || []
  );
  const [defaultOutboundGroup, setDefaultOutboundGroup] = useState(
    existingAgent?.defaultOutboundGroup || ""
  );

  /* Labels */
  const { labels: allLabels, addLabel: addLabelToStore } = useLabelsStore();
  const [assignedLabelIds, setAssignedLabelIds] = useState<number[]>(
    existingAgent?.labels || []
  );
  const [labelSearchQuery, setLabelSearchQuery] = useState("");
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const labelDropdownRef = useRef<HTMLDivElement>(null);
  const [labelActiveIdx, setLabelActiveIdx] = useState(-1);
  const [quickCreateLabel, setQuickCreateLabel] = useState(false);
  const [quickCreateColor, setQuickCreateColor] = useState<LabelColor>("blue");

  const filteredLabels = useMemo(() => {
    const q = labelSearchQuery.toLowerCase().trim();
    if (!q) return allLabels;
    return allLabels.filter((l) => l.name.toLowerCase().includes(q));
  }, [allLabels, labelSearchQuery]);

  const addLabelToAgent = (labelId: number) => {
    if (!assignedLabelIds.includes(labelId)) {
      setAssignedLabelIds((prev) => [...prev, labelId]);
      touch();
    }
    setLabelSearchQuery("");
    setLabelDropdownOpen(false);
    setLabelActiveIdx(-1);
  };

  const removeLabelFromAgent = (labelId: number) => {
    setAssignedLabelIds((prev) => prev.filter((id) => id !== labelId));
    touch();
  };

  const handleQuickCreateLabel = () => {
    const trimmed = labelSearchQuery.trim();
    if (!trimmed) return;
    const existing = allLabels.find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      addLabelToAgent(existing.id);
      return;
    }
    const newLabel = addLabelToStore({ name: trimmed, color: quickCreateColor });
    addLabelToAgent(newLabel.id);
    setQuickCreateLabel(false);
    setQuickCreateColor("blue");
    toast.success(`Label "${trimmed}" creada y asignada`);
  };

  /* Advanced */
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [labelsAccOpen, setLabelsAccOpen] = useState(false);
  const [templatesAccOpen, setTemplatesAccOpen] = useState(false);
  const [templateTab, setTemplateTab] = useState<"chat" | "email">("chat");
  const [iframeUrl, setIframeUrl] = useState(existingAgent?.iframeUrl || "");
  const [languages, setLanguages] = useState<string[]>(
    existingAgent?.languages || []
  );
  const [randomOrder, setRandomOrder] = useState(
    existingAgent?.randomOrder || false
  );
  const [pickupType, setPickupType] = useState<"auto" | "manual">(
    existingAgent?.pickupType || "auto"
  );
  const [pickupTypeChat, setPickupTypeChat] = useState<"auto" | "manual">("auto");

  /* UI state */
  const [formTouched, setFormTouched] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [extensionError, setExtensionError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailFormatError, setEmailFormatError] = useState(false);
  const [emailConflictError, setEmailConflictError] = useState(false);
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* Photo */
  const [photo, setPhoto] = useState<string>(existingAgent?.photo || "");

  /* Group search */
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const [groupActiveIdx, setGroupActiveIdx] = useState(-1);

  /* Delete from edit mode */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /* Expire password dialog */
  const [expireDialogOpen, setExpireDialogOpen] = useState(false);

  /* Templates */
  const [assignedTemplates, setAssignedTemplates] = useState<Set<number>>(new Set());
  const [templateSearch, setTemplateSearch] = useState("");
  const filteredTemplates = useMemo(() => {
    const q = templateSearch.toLowerCase();
    return availableTemplates.filter((t) =>
      t.type === templateTab &&
      (t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q))
    );
  }, [templateSearch, templateTab, availableTemplates]);

  /* Schedule (multi-select) */
  const [assignedScheduleIds, setAssignedScheduleIds] = useState<number[]>(
    existingAgent?.schedules || []
  );
  const [schedulesAccOpen, setSchedulesAccOpen] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const filteredSchedules = useMemo(() => {
    const q = scheduleSearch.toLowerCase();
    return availableSchedules.filter((s) =>
      q === "" || s.name.toLowerCase().includes(q)
    );
  }, [scheduleSearch]);

  /* Login extension override */
  const [loginExtOverride, setLoginExtOverride] = useState(false);

  /* Ref to StickyFormHeader for programmatic name editing (DD#299) */
  const stickyHeaderRef = useRef<import("../shared/StickyFormHeader").StickyFormHeaderHandle>(null);

  /* ── Navigation guard ── */
  const blocker = useNavigationGuard(formTouched && !saving);

  useEffect(() => {
    if (!formTouched) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formTouched]);

  /* ── Ctrl+S to save ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (formTouched && !saving) handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  /* Close dropdowns on outside click + Escape */
  const closeGroupDropdown = useCallback(() => setGroupDropdownOpen(false), []);
  useClickOutside(groupDropdownRef, closeGroupDropdown, groupDropdownOpen);
  const closeLabelDropdown = useCallback(() => { setLabelDropdownOpen(false); setQuickCreateLabel(false); }, []);
  useClickOutside(labelDropdownRef, closeLabelDropdown, labelDropdownOpen);

  /* ── Helpers ── */
  const touch = () => setFormTouched(true);

  const toggleChannel = (ch: "phone" | "chat" | "email") => {
    touch();
    setChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  const togglePermission = (key: keyof AgentPermissions) => {
    touch();
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addGroup = (group: { id: number; name: string }) => {
    touch();
    if (assignedGroups.some((g) => g.id === group.id)) return;
    setAssignedGroups((prev) => [
      ...prev,
      { id: group.id, name: group.name, active: true },
    ]);
    setGroupSearchQuery("");
  };

  const removeGroup = (groupId: number) => {
    touch();
    setAssignedGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (
      defaultOutboundGroup ===
      assignedGroups.find((g) => g.id === groupId)?.name
    ) {
      setDefaultOutboundGroup("");
    }
  };

  const toggleGroupActive = (groupId: number) => {
    touch();
    setAssignedGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, active: !g.active } : g))
    );
  };

  /* ── Group search results ── */
  const filteredAvailableGroups = useMemo(() => {
    if (groupSearchQuery.trim()) {
      return availableGroups.filter((g) =>
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
      );
    }
    return availableGroups;
  }, [groupSearchQuery]);

  const activeAssignedGroups = assignedGroups.filter((g) => g.active);

  /* ── Save ── */
  const handleSave = () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError(true);
      hasError = true;
      if (isEdit) {
        // Open inline header edit so user can fix the name
        stickyHeaderRef.current?.startEditing();
      } else {
        nameInputRef.current?.focus();
      }
    }
    if (!extension.trim()) {
      setExtensionError(true);
      hasError = true;
    }
    if (!agentEmail.trim()) {
      setEmailError(true);
      hasError = true;
      if (!hasError) emailInputRef.current?.focus();
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentEmail.trim())) {
      setEmailFormatError(true);
      hasError = true;
      if (!hasError) emailInputRef.current?.focus();
    }
    if (emailConflictError) {
      hasError = true;
      if (!hasError) emailInputRef.current?.focus();
    }
    if (hasError) return;

    setSaving(true);

    const activeChannels: ("phone" | "chat" | "email")[] = [];
    if (channels.phone) activeChannels.push("phone");
    if (channels.chat) activeChannels.push("chat");
    if (channels.email) activeChannels.push("email");

    const agentData: Omit<Agent, "id" | "code"> = {
      name: name.trim(),
      extension: extension.trim(),
      extensionType,
      agentType,
      channels: activeChannels,
      status: existingAgent?.status || "active",
      phone: agentPhone.trim() || undefined,
      email: agentEmail.trim(),
      pin: existingAgent?.pin,
      groups: assignedGroups,
      defaultOutboundGroup: defaultOutboundGroup || undefined,
      iframeUrl: iframeUrl.trim() || undefined,
      permissions,
      randomOrder,
      pickupType,
      languages,
      photo,
      maxChats,
      labels: assignedLabelIds,
      schedules: assignedScheduleIds,
      isDraft: undefined, // Clear draft flag on save (DD#294)
      ...(isEdit && existingAgent?.isDraft ? { status: "active" as const } : {}), // Activate on draft save (DD#295)
    };

    setTimeout(() => {
      if (isEdit && existingAgent) {
        updateAgent(existingAgent.id, agentData);
        toast.success(
          existingAgent.isDraft
            ? `Agente «${name.trim()}» activado correctamente`
            : `Agente «${name.trim()}» guardado correctamente`
        );
      } else {
        addAgent(agentData);
        toast.success(`Agente «${name.trim()}» creado correctamente`);
      }
      setFormTouched(false);
      setSaving(false);
      navigate("/admin/agentes");
    }, 400);
  };

  /* ── Delete from edit ── */
  const handleDeleteFromEdit = () => {
    if (!existingAgent) return;
    const agentName = existingAgent.name;
    setDeleteDialogOpen(false);
    setFormTouched(false);
    deleteAgent(existingAgent.id);
    toast.success(`Agente «${agentName}» eliminado`);
    navigate("/admin/agentes");
  };

  /* ── Breadcrumbs ── */
  const breadcrumbs = [
    { label: "Administración", path: "/admin/usuarios" },
    { label: "Agentes", path: "/admin/agentes" },
    { label: isEdit ? (name || existingAgent?.name || "Editar") : "Crear agente" },
  ];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />

      {/* Draft banner (DD#294) */}
      {isEdit && existingAgent?.isDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-[12px] text-amber-700">
          <FilePen size={13} className="text-amber-500 shrink-0" />
          <span>Esta entidad es un borrador generado por duplicación. Al guardar se activará automáticamente y pasará a estar operativa.</span>
        </div>
      )}

      {/* ── Sticky header (DD#299: shared StickyFormHeader) ── */}
      <StickyFormHeader
        ref={stickyHeaderRef}
        name={name}
        onNameChange={(newName) => { setName(newName); touch(); }}
        isEdit={isEdit}
        editFallbackTitle={existingAgent?.name || "Editar agente"}
        createTitle="Crear agente"
        onCancel={() => navigate("/admin/agentes")}
        onSave={handleSave}
        saving={saving}
        saveDisabled={!formTouched && isEdit}
      />

      {/* DD#169: Cross-tab conflict warning */}
      {crossTabConflict && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5">
          <span className="text-[12px] text-amber-700">
            Este agente puede estar siendo editado en otra pestaña. Los cambios guardados aquí podrían sobrescribir los de la otra sesión.
          </span>
        </div>
      )}

      {/* ── Form content ── */}
      <div className="flex-1 overflow-auto bg-gray-50/80">
        <div className="flex flex-col lg:flex-row gap-6 px-6 py-6 max-w-[1100px]">
          {/* ── LEFT COLUMN — Identity + Channels (sticky on desktop) ── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6 [&>*:last-child]:mb-0">
              {/* Identificación */}
              <SectionCard title="Identificación" icon={<Fingerprint size={15} className="text-gray-400" />}>
                {/* Photo */}
                <div className="flex flex-col items-center gap-1.5 mb-5">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative w-14 h-14 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer group"
                    style={{ borderRadius: "9999px" }}
                    title={photo ? "Cambiar foto" : "Seleccionar foto"}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={22} className="text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ borderRadius: "9999px" }}
                    >
                      <Camera size={14} className="text-white" />
                    </div>
                  </button>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => { setPhoto(""); touch(); }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("El archivo supera el límite de 2MB");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setPhoto(reader.result as string);
                        touch();
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                {/* Name — only shown in create mode; in edit mode, name is edited inline in the header */}
                {!isEdit && (
                <div className="mb-4">
                  <FieldLabel text="Nombre" required />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError(false);
                      touch();
                    }}
                    className={`${inputClass}${nameError ? " border-red-400" : ""}`}
                    placeholder="Nombre del agente"
                    ref={nameInputRef}
                  />
                  {nameError && (
                    <p className="text-[12px] text-red-400 mt-1.5">
                      El nombre es obligatorio
                    </p>
                  )}
                </div>
                )}

                {/* Email (required) / Phone */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <FieldLabel text="Email" required tooltipKey="email" />
                    <input
                      type="email"
                      value={agentEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgentEmail(val);
                        setEmailError(false);
                        setEmailFormatError(false);
                        setEmailConflictError(false);
                        if (val.trim()) {
                          const conflict = allAgentsFromStore.some(
                            (a) =>
                              a.email?.toLowerCase() === val.trim().toLowerCase() &&
                              a.id !== existingAgent?.id
                          );
                          if (conflict) setEmailConflictError(true);
                        }
                        touch();
                      }}
                      className={`${inputClass}${emailError || emailFormatError || emailConflictError ? " border-red-400" : ""}`}
                      placeholder="email@empresa.com"
                      ref={emailInputRef}
                    />
                    {emailError && (
                      <p className="text-[12px] text-red-400 mt-1.5">
                        El email es obligatorio
                      </p>
                    )}
                    {emailFormatError && (
                      <p className="text-[12px] text-red-400 mt-1.5">
                        Introduce un email válido
                      </p>
                    )}
                    {emailConflictError && (
                      <p className="text-[12px] text-red-400 mt-1.5">
                        Ya existe un agente con este email
                      </p>
                    )}
                  </div>
                  <div>
                    <FieldLabel text="Teléfono" tooltipKey="phone" />
                    <input
                      type="text"
                      value={agentPhone}
                      onChange={(e) => {
                        setAgentPhone(e.target.value);
                        touch();
                      }}
                      className={inputClass}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Extension type + Extension */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <FieldLabel text="Tipo de extensión" tooltipKey="extensionType" />
                    <select
                      value={extensionType}
                      onChange={(e) => {
                        setExtensionType(e.target.value as "phone" | "webrtc");
                        setExtension("");
                        touch();
                      }}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="phone">Teléfono</option>
                      <option value="webrtc">WebRTC</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel text="Extensión" required />
                    <ExtensionCombobox
                      value={extension}
                      onChange={(val) => {
                        setExtension(val);
                        setExtensionError(false);
                        touch();
                      }}
                      extensionType={extensionType}
                      allAgents={allAgentsFromStore}
                      currentAgentId={existingAgent?.id}
                      error={extensionError}
                    />
                    {extensionError && (
                      <p className="text-[12px] text-red-400 mt-1.5">
                        La extensión es obligatoria
                      </p>
                    )}
                  </div>
                </div>

                {/* Agent type */}
                <div>
                  <FieldLabel text="Tipo de agente" tooltipKey="agentType" />
                  <select
                    value={agentType}
                    onChange={(e) => {
                      setAgentType(e.target.value as "normal" | "cuscare" | "cuscare_carrier" | "admin_cuscare");
                      touch();
                    }}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="normal">Agente normal</option>
                    <option value="cuscare">Agente Cuscare</option>
                    <option value="cuscare_carrier">Agente Cuscare Carrier</option>
                    <option value="admin_cuscare">Admin Cuscare</option>
                  </select>
                </div>

                {/* ── Canales (inline within Identificación) ── */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <FieldLabel text="Canales" tooltipKey="channels" />
                  <div className="flex gap-2">
                    {(["phone", "chat", "email"] as const).map((ch) => {
                      const labels = {
                        phone: "Teléfono",
                        chat: "Chat",
                        email: "Email",
                      };
                      const active = channels[ch];
                      const Icon = channelIconMap[ch];
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] border cursor-pointer ${
                            active
                              ? "bg-gray-800 text-white border-gray-800"
                              : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ fontWeight: active ? 500 : 400 }}
                        >
                          <Icon size={14} />
                          {labels[ch]}
                          {ch === "chat" && active && (
                            <span className="text-gray-400">
                              · {maxChats}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Grabación (DD#279 — movido a Identificación para más protagonismo) ── */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between min-h-[28px]">
                    <div className="flex items-center">
                      <span
                        className="text-[13px] text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        Grabación
                      </span>
                      <TooltipIcon tooltipKey="recording" />
                    </div>
                    <ToggleSwitch
                      checked={permissions.recording}
                      onChange={() => togglePermission("recording")}
                      label="Grabación"
                    />
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Settings (scrollable) ── */}
          <div className="flex-1 min-w-0">
          {/* ── Grupos (DD#304: movido arriba de Permisos) ── */}
          <SectionCard title="Grupos" icon={<Users size={15} className="text-gray-400" />}>
            {/* Search-to-add input */}
            <div className="relative mb-4" ref={groupDropdownRef}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar grupo por nombre..."
                  value={groupSearchQuery}
                  onChange={(e) => {
                    setGroupSearchQuery(e.target.value);
                    setGroupDropdownOpen(true);
                    setGroupActiveIdx(-1);
                  }}
                  onFocus={() => setGroupDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (!groupDropdownOpen) return;
                    const selectableGroups = filteredAvailableGroups.filter(
                      (g) => !assignedGroups.some((ag) => ag.id === g.id)
                    );
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setGroupActiveIdx((prev) =>
                        prev < selectableGroups.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setGroupActiveIdx((prev) =>
                        prev > 0 ? prev - 1 : selectableGroups.length - 1
                      );
                    } else if (e.key === "Enter" && groupActiveIdx >= 0) {
                      e.preventDefault();
                      const target = selectableGroups[groupActiveIdx];
                      if (target) addGroup(target);
                      setGroupActiveIdx(-1);
                    } else if (e.key === "Escape") {
                      setGroupDropdownOpen(false);
                      setGroupActiveIdx(-1);
                    }
                  }}
                  role="combobox"
                  aria-expanded={groupDropdownOpen}
                  aria-activedescendant={groupActiveIdx >= 0 ? `group-opt-${groupActiveIdx}` : undefined}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                />
                {groupSearchQuery && (
                  <button
                    onClick={() => {
                      setGroupSearchQuery("");
                      setGroupDropdownOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {groupDropdownOpen && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-gray-200 max-h-[320px] overflow-y-auto" role="listbox">
                  {groupSearchQuery && (
                    <div className="px-3 py-2 border-b border-gray-100 text-[11px] text-gray-400">
                      Resultados para «{groupSearchQuery}»
                    </div>
                  )}
                  {filteredAvailableGroups.length === 0 ? (
                    <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
                      No se encontraron grupos con ese nombre
                    </div>
                  ) : (
                    filteredAvailableGroups.map((group, _idx) => {
                      const isAssigned = assignedGroups.some(
                        (g) => g.id === group.id
                      );
                      // DD#135: compute selectable index for keyboard nav
                      const selectableIdx = isAssigned ? -1 : filteredAvailableGroups
                        .filter((g) => !assignedGroups.some((ag) => ag.id === g.id))
                        .findIndex((g) => g.id === group.id);
                      const isKeyboardActive = !isAssigned && selectableIdx === groupActiveIdx;
                      return (
                        <div
                          key={group.id}
                          id={isKeyboardActive ? `group-opt-${selectableIdx}` : undefined}
                          role="option"
                          aria-selected={isKeyboardActive}
                          className={`flex items-center justify-between px-3 py-2.5 ${
                            isAssigned
                              ? "opacity-50"
                              : isKeyboardActive
                                ? "bg-gray-100 cursor-pointer"
                                : "hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Users size={14} className="text-gray-400" />
                            <span className="text-[13px] text-gray-600">
                              {group.name}
                            </span>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5">
                              {group.agentCount} agentes
                            </span>
                          </div>
                          {isAssigned ? (
                            <span className="text-[11px] text-gray-400">
                              Asignado
                            </span>
                          ) : (
                            <button
                              onClick={() => addGroup(group)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                            >
                              <Plus size={11} />
                              Añadir
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}

                  <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
                    Mostrando todos los grupos disponibles
                  </div>
                </div>
              )}
            </div>

            {/* Assigned groups */}
            <div className="mb-5">
              <div className="mb-3">
                <span
                  className="text-[13px] text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  Grupos asignados
                </span>
              </div>

              {assignedGroups.length === 0 ? (
                <div className="border border-dashed border-gray-300 py-8 flex flex-col items-center gap-2">
                  <Users size={24} className="text-gray-300" />
                  <span className="text-[12px] text-gray-400">
                    Ningún grupo asignado aún
                  </span>
                </div>
              ) : (
                <div className="border border-gray-200">
                  {assignedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-[13px] text-gray-600">
                          {group.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <ToggleSwitch
                          checked={group.active}
                          onChange={() => toggleGroupActive(group.id)}
                          label={`${group.name} activo`}
                        />
                        <button
                          onClick={() => removeGroup(group.id)}
                          className="text-gray-300 hover:text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Quitar del grupo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grupo por defecto para llamadas salientes */}
            <div className={`${assignedGroups.length === 0 ? "opacity-40 pointer-events-none" : ""}`}>
              <FieldLabel
                text="Grupo por defecto para llamadas salientes"
                tooltipKey="defaultOutbound"
              />
              {activeAssignedGroups.length > 0 ? (
                <select
                  value={defaultOutboundGroup}
                  onChange={(e) => {
                    setDefaultOutboundGroup(e.target.value);
                    touch();
                  }}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Seleccionar grupo...</option>
                  {activeAssignedGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-[13px] text-gray-400">
                  {assignedGroups.length > 0
                    ? "Activa al menos un grupo para seleccionar"
                    : "Asigna grupos primero"}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Permisos ── */}
          <SectionCard title="Permisos" icon={<Shield size={15} className="text-gray-400" />}>
            {/* General toggles */}
            <div className="space-y-4 mb-5">
              {([
                {
                  key: "manageDevices" as const,
                  label: "Gestión de dispositivos",
                  tip: "manageDevices",
                },
                {
                  key: "selfActivate" as const,
                  label: "Activación por grupo",
                  tip: "selfActivate",
                },
              ] as const).map((perm) => (
                <div
                  key={perm.key}
                  className="flex items-center justify-between min-h-[28px]"
                >
                  <div className="flex items-center">
                    <span
                      className="text-[13px] text-gray-600"
                      style={{ fontWeight: 500 }}
                    >
                      {perm.label}
                    </span>
                    <TooltipIcon tooltipKey={perm.tip} />
                  </div>
                  <ToggleSwitch
                    checked={permissions[perm.key]}
                    onChange={() => togglePermission(perm.key)}
                    label={perm.label}
                  />
                </div>
              ))}
            </div>

            {/* ── Llamadas (nested) ── */}
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <PhoneCall size={13} className={channels.phone ? "text-gray-400" : "text-gray-300"} />
                <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Llamadas
                </span>
                {!channels.phone && (
                  <span className="text-[11px] text-gray-400 ml-auto">
                    Activa el canal Teléfono
                  </span>
                )}
              </div>
              <div className={`${!channels.phone ? "opacity-40 pointer-events-none" : ""}`}>
                {/* Destination types matrix */}
                <div className="mb-5">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-[11px] text-gray-400 uppercase tracking-wider py-2 pr-4" style={{ fontWeight: 600 }}>
                          Destino
                        </th>
                        <th className="text-center py-2 px-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Llamadas
                            </span>
                            {(() => {
                              const callKeys = ["callsDestFixed", "callsDestMobile", "callsDestInternational", "callsDestSpecial"] as const;
                              const checkedCount = callKeys.filter((k) => permissions[k as keyof AgentPermissions]).length;
                              const allChecked = checkedCount === 4;
                              const someChecked = checkedCount > 0 && checkedCount < 4;
                              return (
                                <input
                                  type="checkbox"
                                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                  checked={allChecked || someChecked}
                                  onChange={() => {
                                    touch();
                                    const target = !allChecked;
                                    setPermissions((prev) => ({
                                      ...prev,
                                      callsEnabled: target,
                                      callsDestFixed: target,
                                      callsDestMobile: target,
                                      callsDestInternational: target,
                                      callsDestSpecial: target,
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 cursor-pointer accent-gray-800"
                                />
                              );
                            })()}
                          </label>
                        </th>
                        <th className="text-center py-2 px-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Transferencias
                            </span>
                            {(() => {
                              const transferKeys = ["transfersDestFixed", "transfersDestMobile", "transfersDestInternational", "transfersDestSpecial"] as const;
                              const checkedCount = transferKeys.filter((k) => permissions[k as keyof AgentPermissions]).length;
                              const allChecked = checkedCount === 4;
                              const someChecked = checkedCount > 0 && checkedCount < 4;
                              return (
                                <input
                                  type="checkbox"
                                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                  checked={allChecked || someChecked}
                                  onChange={() => {
                                    touch();
                                    const target = !allChecked;
                                    setPermissions((prev) => ({
                                      ...prev,
                                      transfersEnabled: target,
                                      transfersDestFixed: target,
                                      transfersDestMobile: target,
                                      transfersDestInternational: target,
                                      transfersDestSpecial: target,
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 cursor-pointer accent-gray-800"
                                />
                              );
                            })()}
                          </label>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { label: "Fijos", callKey: "callsDestFixed" as const, transferKey: "transfersDestFixed" as const },
                        { label: "Móviles", callKey: "callsDestMobile" as const, transferKey: "transfersDestMobile" as const },
                        { label: "Internacionales", callKey: "callsDestInternational" as const, transferKey: "transfersDestInternational" as const },
                        { label: "Numeración especial", callKey: "callsDestSpecial" as const, transferKey: "transfersDestSpecial" as const },
                      ]).map((row) => (
                        <tr key={row.label} className="border-b border-gray-100 last:border-b-0">
                          <td className="text-[13px] text-gray-500 py-2.5 pr-4">
                            {row.label}
                          </td>
                          <td className="text-center py-2.5 px-4">
                            <input
                              type="checkbox"
                              checked={permissions[row.callKey]}
                              onChange={() => {
                                touch();
                                setPermissions((prev) => {
                                  const next = { ...prev, [row.callKey]: !prev[row.callKey] };
                                  const callKeys = ["callsDestFixed", "callsDestMobile", "callsDestInternational", "callsDestSpecial"] as const;
                                  next.callsEnabled = callKeys.some((k) => k === row.callKey ? !prev[row.callKey] : prev[k as keyof AgentPermissions]);
                                  return next;
                                });
                              }}
                              className="w-3.5 h-3.5 cursor-pointer accent-gray-800"
                            />
                          </td>
                          <td className="text-center py-2.5 px-4">
                            <input
                              type="checkbox"
                              checked={permissions[row.transferKey]}
                              onChange={() => {
                                touch();
                                setPermissions((prev) => {
                                  const next = { ...prev, [row.transferKey]: !prev[row.transferKey] };
                                  const transferKeys = ["transfersDestFixed", "transfersDestMobile", "transfersDestInternational", "transfersDestSpecial"] as const;
                                  next.transfersEnabled = transferKeys.some((k) => k === row.transferKey ? !prev[row.transferKey] : prev[k as keyof AgentPermissions]);
                                  return next;
                                });
                              }}
                              className="w-3.5 h-3.5 cursor-pointer accent-gray-800"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


              </div>
            </div>
          </SectionCard>

          {/* ── Configuración avanzada ── */}
          <div className="border border-gray-200 bg-white mb-8">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center gap-2 bg-gray-50 px-5 py-3.5 cursor-pointer hover:bg-gray-100"
            >
              {advancedOpen ? (
                <ChevronDown size={15} className="text-gray-400" />
              ) : (
                <ChevronRight size={15} className="text-gray-400" />
              )}
              <Settings size={15} className="text-gray-400" />
              <span
                className="text-[14px] text-gray-800"
                style={{ fontWeight: 600 }}
              >
                Configuración avanzada
              </span>
              {!advancedOpen && (
                <span className="text-[12px] text-gray-400 ml-2">
                  (valores por defecto aplicados)
                </span>
              )}
            </button>

            {advancedOpen && (
              <div className="px-5 py-5">

                {/* ── Labels (accordion) ── */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setLabelsAccOpen(!labelsAccOpen)}
                    className="w-full flex items-center gap-2 cursor-pointer group/lbl"
                  >
                    {labelsAccOpen ? (
                      <ChevronDown size={13} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={13} className="text-gray-400" />
                    )}
                    <Tag size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Labels
                    </span>
                    {!labelsAccOpen && assignedLabelIds.length > 0 && (
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {assignedLabelIds.length} asignada{assignedLabelIds.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                  {labelsAccOpen && (
                  <div className="mt-3">
                  <div className="relative mb-4" ref={labelDropdownRef}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar o crear label..."
                  value={labelSearchQuery}
                  onChange={(e) => {
                    setLabelSearchQuery(e.target.value);
                    setLabelDropdownOpen(true);
                    setLabelActiveIdx(-1);
                    setQuickCreateLabel(false);
                  }}
                  onFocus={() => setLabelDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (!labelDropdownOpen) return;
                    const selectableLabels = filteredLabels.filter(
                      (l) => !assignedLabelIds.includes(l.id)
                    );
                    const hasQuickCreate = labelSearchQuery.trim() &&
                      !allLabels.some((l) => l.name.toLowerCase() === labelSearchQuery.trim().toLowerCase());
                    const totalItems = selectableLabels.length + (hasQuickCreate ? 1 : 0);

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setLabelActiveIdx((prev) =>
                        prev < totalItems - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setLabelActiveIdx((prev) =>
                        prev > 0 ? prev - 1 : totalItems - 1
                      );
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (quickCreateLabel) {
                        handleQuickCreateLabel();
                      } else if (labelActiveIdx >= 0 && labelActiveIdx < selectableLabels.length) {
                        addLabelToAgent(selectableLabels[labelActiveIdx].id);
                      } else if (hasQuickCreate && labelActiveIdx === selectableLabels.length) {
                        setQuickCreateLabel(true);
                      }
                    } else if (e.key === "Escape") {
                      setLabelDropdownOpen(false);
                      setLabelActiveIdx(-1);
                      setQuickCreateLabel(false);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                />
                {labelSearchQuery && (
                  <button
                    onClick={() => {
                      setLabelSearchQuery("");
                      setLabelDropdownOpen(false);
                      setQuickCreateLabel(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {labelDropdownOpen && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-gray-200 max-h-[320px] overflow-y-auto">
                  {(() => {
                    const selectableLabels = filteredLabels.filter(
                      (l) => !assignedLabelIds.includes(l.id)
                    );
                    const hasQuickCreate = labelSearchQuery.trim() &&
                      !allLabels.some((l) => l.name.toLowerCase() === labelSearchQuery.trim().toLowerCase());

                    return (
                      <>
                        {selectableLabels.length === 0 && !hasQuickCreate ? (
                          <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
                            {labelSearchQuery
                              ? "No se encontraron labels"
                              : assignedLabelIds.length === allLabels.length
                                ? "Todas las labels están asignadas"
                                : "No hay labels disponibles"}
                          </div>
                        ) : (
                          <>
                            {selectableLabels.map((label, idx) => {
                              const isAssigned = assignedLabelIds.includes(label.id);
                              const isActive = idx === labelActiveIdx;
                              return (
                                <div
                                  key={label.id}
                                  className={`flex items-center justify-between px-3 py-2.5 ${
                                    isAssigned
                                      ? "opacity-50"
                                      : isActive
                                        ? "bg-gray-100 cursor-pointer"
                                        : "hover:bg-gray-50 cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!isAssigned) addLabelToAgent(label.id);
                                  }}
                                >
                                  <LabelChip label={label} size="sm" />
                                  {label.description && (
                                    <span className="text-[11px] text-gray-400 ml-2 truncate max-w-[180px]">
                                      {label.description}
                                    </span>
                                  )}
                                  {isAssigned && (
                                    <span className="text-[11px] text-gray-400 ml-auto">
                                      Asignada
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {/* Quick create option */}
                            {hasQuickCreate && !quickCreateLabel && (
                              <div
                                className={`flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 ${
                                  labelActiveIdx === selectableLabels.length
                                    ? "bg-gray-100 cursor-pointer"
                                    : "hover:bg-gray-50 cursor-pointer"
                                }`}
                                onClick={() => setQuickCreateLabel(true)}
                              >
                                <Plus size={13} className="text-gray-400" />
                                <span className="text-[13px] text-gray-600">
                                  Crear "<span style={{ fontWeight: 500 }}>{labelSearchQuery.trim()}</span>"
                                </span>
                              </div>
                            )}

                            {/* Quick create inline color picker */}
                            {quickCreateLabel && (
                              <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="text-[12px] text-gray-500 mb-2">
                                  Elige un color para "<span style={{ fontWeight: 500 }}>{labelSearchQuery.trim()}</span>":
                                </div>
                                <div className="flex items-center gap-1.5 mb-3">
                                  {LABEL_COLORS.map((c) => {
                                    const s = labelColorStyles[c];
                                    const isSel = c === quickCreateColor;
                                    return (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => setQuickCreateColor(c)}
                                        className={`w-6 h-6 flex items-center justify-center cursor-pointer border ${
                                          isSel ? "border-gray-600" : "border-transparent hover:border-gray-300"
                                        }`}
                                      >
                                        <span className={`w-3.5 h-3.5 ${s.dot}`} />
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleQuickCreateLabel}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                                    style={{ fontWeight: 500 }}
                                  >
                                    Crear y asignar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuickCreateLabel(false)}
                                    className="px-3 py-1 text-[12px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Assigned labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[13px] text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  Labels asignadas
                </span>
              </div>

              {assignedLabelIds.length === 0 ? (
                <div className="border border-dashed border-gray-300 py-8 flex flex-col items-center gap-2">
                  <Tag size={24} className="text-gray-300" />
                  <span className="text-[12px] text-gray-400">
                    Ninguna label asignada aún
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {assignedLabelIds.map((labelId) => {
                    const label = allLabels.find((l) => l.id === labelId);
                    if (!label) return null;
                    return (
                      <LabelChip
                        key={labelId}
                        label={label}
                        size="sm"
                        onRemove={() => removeLabelFromAgent(labelId)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
                  </div>
                  )}
                </div>

                {/* ── Agendas (accordion) ── */}
                <div className="border-t border-gray-200 mt-5 pt-5 mb-5">
                  <button
                    type="button"
                    onClick={() => setSchedulesAccOpen(!schedulesAccOpen)}
                    className="w-full flex items-center gap-2 cursor-pointer group/sched"
                  >
                    {schedulesAccOpen ? (
                      <ChevronDown size={13} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={13} className="text-gray-400" />
                    )}
                    <Phone size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Agendas
                    </span>
                    {!schedulesAccOpen && assignedScheduleIds.length > 0 && (
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {assignedScheduleIds.length} asignada{assignedScheduleIds.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                  {schedulesAccOpen && (
                    <div className="mt-3">
                      {availableSchedules.length > 4 && (
                        <div className="relative mb-2">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar agenda..."
                            value={scheduleSearch}
                            onChange={(e) => setScheduleSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 text-[12px] focus:outline-none focus:border-gray-400 bg-white"
                          />
                          {scheduleSearch && (
                            <button
                              type="button"
                              onClick={() => setScheduleSearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="border border-gray-200 overflow-hidden">
                        {filteredSchedules.length === 0 ? (
                          <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
                            Sin resultados
                          </div>
                        ) : filteredSchedules.map((sched, idx) => {
                          const isChecked = assignedScheduleIds.includes(sched.id);
                          return (
                            <div
                              key={sched.id}
                              className={`group/schedrow flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                                idx < filteredSchedules.length - 1 ? "border-b border-gray-100" : ""
                              } ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                              onClick={() => {
                                touch();
                                setAssignedScheduleIds((prev) =>
                                  prev.includes(sched.id)
                                    ? prev.filter((id) => id !== sched.id)
                                    : [...prev, sched.id]
                                );
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${
                                  isChecked ? "opacity-100" : "opacity-0 group-hover/schedrow:opacity-100"
                                }`}
                                tabIndex={-1}
                              />
                              <Phone size={13} className="text-gray-400 shrink-0" />
                              <span className="text-[13px] text-gray-600 flex-1" style={{ fontWeight: isChecked ? 500 : 400 }}>
                                {sched.name}
                              </span>
                              {isChecked && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    touch();
                                    setAssignedScheduleIds((prev) => prev.filter((id) => id !== sched.id));
                                  }}
                                  className="text-gray-300 hover:text-gray-500 cursor-pointer shrink-0 opacity-0 group-hover/schedrow:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {assignedScheduleIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {assignedScheduleIds.map((sid) => {
                            const sched = availableSchedules.find((s) => s.id === sid);
                            if (!sched) return null;
                            return (
                              <span
                                key={sid}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 text-[12px] text-gray-600 bg-white"
                                style={{ fontWeight: 500 }}
                              >
                                {sched.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    touch();
                                    setAssignedScheduleIds((prev) => prev.filter((id) => id !== sid));
                                  }}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-2">
                        Repositorios &gt; Agendas
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Plantillas (accordion) ── */}
                <div className="border-t border-gray-200 mt-5 pt-5 mb-5">
                  <button
                    type="button"
                    onClick={() => setTemplatesAccOpen(!templatesAccOpen)}
                    className="w-full flex items-center gap-2 cursor-pointer"
                  >
                    {templatesAccOpen ? (
                      <ChevronDown size={13} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={13} className="text-gray-400" />
                    )}
                    <FileStack size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Plantillas
                    </span>
                    {!templatesAccOpen && assignedTemplates.size > 0 && (
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {assignedTemplates.size} asignada{assignedTemplates.size !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>

                  {templatesAccOpen && (
                  <div className="mt-3">
                  {/* Tabs Chat / Email */}
                  <div className="flex items-center gap-0 mb-3 border-b border-gray-200">
                    {(["chat", "email"] as const).map((tab) => {
                      const isActive = templateTab === tab;
                      const countInTab = availableTemplates.filter((t) => t.type === tab).length;
                      const assignedInTab = availableTemplates.filter(
                        (t) => t.type === tab && assignedTemplates.has(t.id)
                      ).length;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setTemplateTab(tab);
                            setTemplateSearch("");
                          }}
                          className={`px-4 py-2 text-[12px] cursor-pointer border-b-2 transition-colors ${
                            isActive
                              ? "border-gray-800 text-gray-800"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                          style={{ fontWeight: isActive ? 600 : 400 }}
                        >
                          <span className="flex items-center gap-1.5">
                            {tab === "chat" ? <MessageSquare size={12} /> : <Mail size={12} />}
                            {tab === "chat" ? "Chat" : "Email"}
                            <span className="text-[11px] text-gray-400">
                              {assignedInTab}/{countInTab}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Buscar plantilla..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                    />
                    {templateSearch && (
                      <button
                        onClick={() => setTemplateSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Template list — no Tipo column, checkbox on hover */}
                  <div className="border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="w-8 px-2 py-2">
                            <input
                              type="checkbox"
                              checked={filteredTemplates.length > 0 && filteredTemplates.every((t) => assignedTemplates.has(t.id))}
                              onChange={() => {
                                const allChecked = filteredTemplates.every((t) => assignedTemplates.has(t.id));
                                const next = new Set(assignedTemplates);
                                filteredTemplates.forEach((t) => {
                                  if (allChecked) next.delete(t.id);
                                  else next.add(t.id);
                                });
                                setAssignedTemplates(next);
                                touch();
                              }}
                              className="w-3.5 h-3.5 cursor-pointer"
                              aria-label="Seleccionar todas las plantillas"
                            />
                          </th>
                          <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            Título
                          </th>
                          <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            Vista previa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTemplates.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-[12px] text-gray-400">
                              No se encontraron plantillas de {templateTab}
                            </td>
                          </tr>
                        ) : (
                          filteredTemplates.map((tpl) => {
                            const isChecked = assignedTemplates.has(tpl.id);
                            return (
                              <tr
                                key={tpl.id}
                                className={`group/tplrow border-b border-gray-100 last:border-b-0 cursor-pointer ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                                onClick={() => {
                                  const next = new Set(assignedTemplates);
                                  if (next.has(tpl.id)) next.delete(tpl.id);
                                  else next.add(tpl.id);
                                  setAssignedTemplates(next);
                                  touch();
                                }}
                              >
                                <td className="px-2 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${isChecked ? "opacity-100" : "opacity-0 group-hover/tplrow:opacity-100"}`}
                                    tabIndex={-1}
                                    aria-label={`Seleccionar ${tpl.title}`}
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-[13px] text-gray-600" style={{ fontWeight: 500 }}>
                                  {tpl.title}
                                </td>
                                <td className="px-3 py-2.5 text-[12px] text-gray-400 max-w-[280px] relative group/preview">
                                  <span className="block truncate">{tpl.body}</span>
                                  {tpl.body.length > 40 && (
                                    <span className="hidden group-hover/preview:block absolute z-50 bottom-full left-0 mb-1 px-3 py-2 bg-gray-800 text-white text-[11px] max-w-[400px] whitespace-pre-wrap pointer-events-none">
                                      {tpl.body}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  </div>
                  )}
                </div>

                {/* ── Comportamiento ── */}
                <div className="border-t border-gray-200 mt-5 pt-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Comportamiento
                    </span>
                  </div>

                  {/* Descuelgue grid — channel-conditional with opacity (no layout shift) */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`transition-opacity duration-150 ${channels.phone ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <FieldLabel
                        text="Descuelgue — Llamada"
                        tooltipKey="pickupType"
                      />
                      <select
                        value={pickupType}
                        onChange={(e) => {
                          setPickupType(e.target.value as "auto" | "manual");
                          touch();
                        }}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="auto">Automático</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div className={`transition-opacity duration-150 ${channels.chat ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <FieldLabel
                        text="Descuelgue — Chat"
                        tooltipKey="pickupTypeChat"
                      />
                      <select
                        value={pickupTypeChat}
                        onChange={(e) => {
                          setPickupTypeChat(e.target.value as "auto" | "manual");
                          touch();
                        }}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="auto">Automático</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  {/* Chats simultáneos + Orden aleatorio — side by side */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`transition-opacity duration-150 min-h-[52px] ${channels.chat ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <FieldLabel text="Chats simultáneos" tooltipKey="maxChats" />
                      <select
                        value={maxChats}
                        onChange={(e) => {
                          setMaxChats(Number(e.target.value));
                          touch();
                        }}
                        className="w-20 px-2 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white cursor-pointer"
                      >
                        {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between min-h-[52px]">
                      <div className="flex items-center">
                        <span
                          className="text-[13px] text-gray-600"
                          style={{ fontWeight: 500 }}
                        >
                          Orden aleatorio
                        </span>
                        <TooltipIcon tooltipKey="randomOrder" />
                      </div>
                      <ToggleSwitch
                        checked={randomOrder}
                        onChange={() => {
                          setRandomOrder(!randomOrder);
                          touch();
                        }}
                        label="Visualizar agentes en orden aleatorio"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Integración ── */}
                <div className="border-t border-gray-200 pt-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Plug size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Integración
                    </span>
                  </div>

                  {/* Iframe URL */}
                  <div className="mb-4">
                    <FieldLabel text="URL iframe" tooltipKey="iframe" />
                    <input
                      type="url"
                      value={iframeUrl}
                      onChange={(e) => {
                        setIframeUrl(e.target.value);
                        touch();
                      }}
                      placeholder="https://ejemplo.com/panel"
                      className="w-full border border-gray-300 rounded-md px-3 py-[7px] text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between min-h-[28px]">
                    <div className="flex items-center">
                      <span
                        className="text-[13px] text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        Dispositivos externos
                      </span>
                      <TooltipIcon tooltipKey="externalDevices" />
                    </div>
                    <ToggleSwitch
                      checked={permissions.externalDevices}
                      onChange={() => togglePermission("externalDevices")}
                      label="Dispositivos externos"
                    />
                  </div>
                </div>

                {/* ── Regional ── */}
                <div className="border-t border-gray-200 pt-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Regional
                    </span>
                  </div>

                  <div>
                    {/* Idioma */}
                    <div>
                      <FieldLabel text="Idioma" tooltipKey="languages" />
                      <select
                        value=""
                        onChange={(e) => {
                          const lang = e.target.value;
                          if (lang && !languages.includes(lang)) {
                            setLanguages((prev) => [...prev, lang]);
                            touch();
                          }
                        }}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="">Seleccionar idioma...</option>
                        {["Español", "Inglés", "Francés", "Portugués", "Alemán", "Italiano"]
                          .filter((l) => !languages.includes(l))
                          .map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                      </select>
                      {languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {languages.map((lang) => (
                            <span
                              key={lang}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 text-[12px] text-gray-600 bg-white"
                              style={{ fontWeight: 500 }}
                            >
                              {lang}
                              <button
                                type="button"
                                onClick={() => {
                                  setLanguages((prev) => prev.filter((l) => l !== lang));
                                  touch();
                                }}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* ── Sesión ── */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <LogIn size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Sesión
                    </span>
                  </div>

                  <div className="flex items-center justify-between min-h-[28px]">
                    <div className="flex items-center">
                      <span
                        className="text-[13px] text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        Actualizar teléfono en login
                      </span>
                      <TooltipIcon tooltipKey="loginExtOverride" />
                    </div>
                    <ToggleSwitch
                      checked={loginExtOverride}
                      onChange={() => {
                        setLoginExtOverride(!loginExtOverride);
                        touch();
                      }}
                      label="Actualizar teléfono en login"
                    />
                  </div>

                  {/* Seguridad (only in edit mode) */}
                  {isEdit && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <span
                        className="text-[13px] text-gray-500 mb-3 block"
                        style={{ fontWeight: 600 }}
                      >
                        Seguridad
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <span
                            className="text-[13px] text-gray-600"
                            style={{ fontWeight: 500 }}
                          >
                            Expirar contraseña
                          </span>
                          <p className="text-[12px] text-gray-400 mt-1">
                            Fuerza al agente a establecer una nueva contraseña en su próximo inicio de sesión
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpireDialogOpen(true)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-600 border border-gray-300 hover:bg-gray-100 cursor-pointer shrink-0"
                        >
                          <Key size={14} className="text-gray-400" />
                          Expirar contraseña
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Zona peligrosa (only in edit mode) ── */}
          {isEdit && existingAgent && (
            <div className="border border-red-200 bg-white mb-8">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <span
                    className="text-[13px] text-red-500"
                    style={{ fontWeight: 600 }}
                  >
                    Eliminar agente
                  </span>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Esta acción no se puede deshacer. El agente será desasignado de todos sus grupos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-red-500 border border-red-300 hover:bg-red-50 cursor-pointer shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  <Trash2 size={14} />
                  Eliminar agente
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── Discard changes dialog ── */}
      {blocker.state === "blocked" && (
        <DiscardDialog
          onStay={blocker.reset}
          onDiscard={blocker.proceed}
        />
      )}

      {/* ── Expire password dialog ── */}
      {expireDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setExpireDialogOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white border border-gray-300 z-50">
            <div className="px-6 pt-6 pb-2 flex flex-col items-center">
              <div className="w-12 h-12 border border-dashed border-gray-300 flex items-center justify-center mb-4">
                <Key size={22} className="text-gray-500" />
              </div>
              <h3
                className="text-[16px] text-gray-800 text-center"
                style={{ fontWeight: 600 }}
              >
                ¿Expirar contraseña?
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-[13px] text-gray-500 text-center">
                La contraseña del agente «
                <span style={{ fontWeight: 600 }}>
                  {existingAgent?.name}
                </span>
                » se marcará como expirada. El agente deberá establecer una
                nueva contraseña en su próximo inicio de sesión.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setExpireDialogOpen(false)}
                className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setExpireDialogOpen(false);
                  toast.success(
                    `Contraseña de «${existingAgent?.name}» expirada correctamente`
                  );
                }}
                className="px-4 py-2 bg-gray-800 text-white text-[13px] hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                Expirar contraseña
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete from edit dialog ── */}
      {deleteDialogOpen && existingAgent && (
        <DeleteEntityDialog
          type="single"
          items={[{ id: existingAgent.id, name: existingAgent.name }]}
          entitySingular="agente"
          entityPlural="agentes"
          singleDetailMessage={`El agente será desasignado de ${existingAgent.groups.length === 1 ? "1 grupo" : `${existingAgent.groups.length} grupos`} automáticamente.`}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteFromEdit}
        />
      )}
    </>
  );
}