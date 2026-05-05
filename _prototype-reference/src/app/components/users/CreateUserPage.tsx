import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useNavigationGuard } from "../shared/useNavigationGuard";
import { useCrossTabWarning } from "../shared/useCrossTabWarning";
import { TopBar } from "../layout/TopBar";
import { useUsersStore } from "./useUsersStore";
import { useGroupsStore } from "../groups/useGroupsStore";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { StickyFormHeader } from "../shared/StickyFormHeader";
import type { StickyFormHeaderHandle } from "../shared/StickyFormHeader";
import {
  SectionCard,
  FieldLabel as FieldLabelBase,
  TooltipIcon as TooltipIconBase,
  DiscardDialog,
  inputClass,
} from "../shared/FormComponents";
import { toast } from "sonner";
import {
  userTypeLabels,
  userTypeOptions,
  defaultSections,
  defaultPermissions,
  sectionLabels,
  permissionLabels,
  availableServices,
  type User,
  type UserType,
  type UserSections,
  type UserPermissions,
} from "./usersData";
import {
  Pencil,
  Check,
  X,
  Loader2,
  Trash2,
  Camera,
  Fingerprint,
  Eye,
  Users,
  Search,
  FilePen,
  UserCog,
  Settings,
} from "lucide-react";

/* ───── Tooltip data ───── */
const tooltips: Record<string, string> = {
  email: "Se usa para las notificaciones, recuperacion de contrasena y acceso al sistema",
  identifier: "Codigo unico interno para integraciones y trazabilidad. Si se deja vacio se genera automaticamente",
  type: "Define los permisos base del usuario. Administrador tiene acceso total. Visor tiene acceso de solo lectura",
  sections: "Secciones del panel de supervision a las que el usuario tiene acceso",
  permissions: "Permisos especificos que complementan el acceso por secciones",
  groups: "Grupos de atencion que el usuario puede supervisar y gestionar",
  services: "Servicios VUI asignados al usuario para supervision",
};

/* Local wrappers */
function FieldLabel({ text, required, tooltipKey }: { text: string; required?: boolean; tooltipKey?: string }) {
  return <FieldLabelBase text={text} required={required} tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}
function TooltipIcon({ tooltipKey }: { tooltipKey: string }) {
  return <TooltipIconBase tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}

/* ═══════ MAIN COMPONENT ═══════ */
export function CreateUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const { groups: allGroups } = useGroupsStore();

  /* ── Mode ── */
  const isEdit = !!id;
  const existingUser = isEdit ? users.find((u) => u.id === Number(id)) : undefined;

  /* Redirect if editing non-existent user */
  useEffect(() => {
    if (isEdit && !existingUser) {
      navigate("/admin/usuarios", { replace: true });
    }
  }, [isEdit, existingUser, navigate]);

  /* ── Cross-tab warning ── */
  const crossTabConflict = useCrossTabWarning("user", existingUser?.id);

  /* ── Form state ── */
  const [name, setName] = useState(existingUser?.name || "");
  const [email, setEmail] = useState(existingUser?.email || "");
  const [identifier, setIdentifier] = useState(existingUser?.identifier || "");
  const [userType, setUserType] = useState<UserType>(existingUser?.type || "administrator");
  const [photo, setPhoto] = useState<string | undefined>(existingUser?.photo);
  const [sections, setSections] = useState<UserSections>(existingUser?.sections || { ...defaultSections });
  const [permissions, setPermissions] = useState<UserPermissions>(existingUser?.permissions || { ...defaultPermissions });
  const [assignedGroupIds, setAssignedGroupIds] = useState<Set<number>>(new Set(existingUser?.assignedGroups || []));
  const [assignedServices, setAssignedServices] = useState<Set<string>>(new Set(existingUser?.assignedServices || []));

  /* ── UI state ── */
  const [formTouched, setFormTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailFormatError, setEmailFormatError] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ── Delete dialog ── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /* ── Groups search ── */
  const [groupSearch, setGroupSearch] = useState("");
  const filteredGroups = useMemo(() => {
    const q = groupSearch.toLowerCase();
    return allGroups.filter((g) => q === "" || g.name.toLowerCase().includes(q));
  }, [allGroups, groupSearch]);

  /* ── Services search ── */
  const [serviceSearch, setServiceSearch] = useState("");
  const filteredServices = useMemo(() => {
    const q = serviceSearch.toLowerCase();
    return availableServices.filter((s) => q === "" || s.toLowerCase().includes(q));
  }, [serviceSearch]);

  /* ── Navigation guard ── */
  const blocker = useNavigationGuard(formTouched && !saving);

  useEffect(() => {
    if (!formTouched) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formTouched]);

  /* ── Ctrl+S ── */
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

  /* ── Helpers ── */
  const touch = () => setFormTouched(true);

  const toggleSection = (key: keyof UserSections) => {
    touch();
    setSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // If toggling off a parent, also toggle off children
      if (key === "stats" && next.stats === false) {
        next.statsDataReports = false;
        next.statsFlowAnalyzer = false;
      }
      // If toggling on a child, ensure parent is on
      if ((key === "statsDataReports" || key === "statsFlowAnalyzer") && next[key]) {
        next.stats = true;
      }
      return next;
    });
  };

  const togglePermission = (key: keyof UserPermissions) => {
    touch();
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGroup = (groupId: number) => {
    touch();
    setAssignedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const toggleService = (service: string) => {
    touch();
    setAssignedServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  };

  /* ── Photo ── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  /* ── Save ── */
  const handleSave = () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError(true);
      hasError = true;
      if (isEdit) {
        stickyHeaderRef.current?.startEditing();
      } else {
        nameInputRef.current?.focus();
      }
    }
    if (!email.trim()) {
      setEmailError(true);
      hasError = true;
      if (!hasError) emailInputRef.current?.focus();
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailFormatError(true);
      hasError = true;
      if (!hasError) emailInputRef.current?.focus();
    }
    if (hasError) return;

    setSaving(true);

    const userData: Omit<User, "id" | "code"> = {
      name: name.trim(),
      email: email.trim(),
      identifier: identifier.trim() || `AUTO_${Date.now().toString(36).toUpperCase()}`,
      type: userType,
      photo,
      sections,
      permissions,
      assignedGroups: Array.from(assignedGroupIds),
      assignedServices: Array.from(assignedServices),
      status: existingUser?.status || "active",
      createdAt: existingUser?.createdAt || new Date().toISOString().slice(0, 10),
      isDraft: undefined,
      ...(isEdit && existingUser?.isDraft ? { status: "active" as const } : {}),
    };

    setTimeout(() => {
      if (isEdit && existingUser) {
        updateUser(existingUser.id, userData);
        toast.success(
          existingUser.isDraft
            ? `Usuario "${name.trim()}" activado correctamente`
            : `Usuario "${name.trim()}" guardado correctamente`
        );
      } else {
        addUser(userData);
        toast.success(`Usuario "${name.trim()}" creado correctamente`);
      }
      setFormTouched(false);
      setSaving(false);
      navigate("/admin/usuarios");
    }, 400);
  };

  /* ── Delete ── */
  const handleDeleteFromEdit = () => {
    if (!existingUser) return;
    const userName = existingUser.name;
    setDeleteDialogOpen(false);
    setFormTouched(false);
    deleteUser(existingUser.id);
    toast.success(`Usuario "${userName}" eliminado`);
    navigate("/admin/usuarios");
  };

  /* ── Breadcrumbs ── */
  const breadcrumbs = [
    { label: "Administración", path: "/admin/usuarios" },
    { label: "Usuarios", path: "/admin/usuarios" },
    { label: isEdit ? (name || existingUser?.name || "Editar") : "Crear usuario" },
  ];

  /* ── Profile summary (left panel) ── */
  const [summaryTab, setSummaryTab] = useState<"groups" | "services">("groups");

  /* Ref to StickyFormHeader for programmatic name editing (DD#299) */
  const stickyHeaderRef = useRef<StickyFormHeaderHandle>(null);

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />

      {/* Draft banner */}
      {isEdit && existingUser?.isDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-[12px] text-amber-700">
          <FilePen size={13} className="text-amber-500 shrink-0" />
          <span>Esta entidad es un borrador generado por duplicacion. Al guardar se activara automaticamente y pasara a estar operativa.</span>
        </div>
      )}

      {/* ── Sticky header (DD#299: shared StickyFormHeader) ── */}
      <StickyFormHeader
        ref={stickyHeaderRef}
        name={name}
        onNameChange={(newName) => { setName(newName); touch(); }}
        isEdit={isEdit}
        editFallbackTitle={existingUser?.name || "Editar usuario"}
        createTitle="Crear usuario"
        onCancel={() => navigate("/admin/usuarios")}
        onSave={handleSave}
        saving={saving}
        saveDisabled={!formTouched && isEdit}
      />

      {/* Cross-tab warning */}
      {crossTabConflict && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5">
          <span className="text-[12px] text-amber-700">
            Este usuario puede estar siendo editado en otra pestana. Los cambios guardados aqui podrian sobrescribir los de la otra sesion.
          </span>
        </div>
      )}

      {/* ── Form content ── */}
      <div className="flex-1 overflow-auto bg-gray-50/80">
        <div className="flex flex-col lg:flex-row gap-6 px-6 py-6 max-w-[1100px]">

          {/* ── LEFT COLUMN — Profile summary (sticky) ── */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="lg:sticky lg:top-6 [&>*:last-child]:mb-0">
              <SectionCard title="Resumen de perfil" icon={<UserCog size={15} className="text-gray-400" />}>
                {/* Photo */}
                <div className="flex flex-col items-center gap-1.5 mb-5">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative w-16 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer group"
                    style={{ borderRadius: "9999px" }}
                    title={photo ? "Cambiar foto" : "Seleccionar foto"}
                  >
                    {photo ? (
                      <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCog size={28} className="text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={16} className="text-white" />
                    </div>
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <span className="text-[11px] text-gray-400">JPG, GIF o PNG. Max 800k</span>
                  {photo && (
                    <button
                      onClick={() => { setPhoto(undefined); touch(); }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Eliminar foto
                    </button>
                  )}
                </div>

                {/* Summary data */}
                <div className="text-center mb-4">
                  <div className="text-[14px] text-gray-700" style={{ fontWeight: 500 }}>
                    {name || "-"}
                  </div>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-gray-600 truncate ml-2 max-w-[160px]">{email || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tipo:</span>
                    <span className="text-gray-600">{userTypeLabels[userType]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Identificador:</span>
                    <span className="text-gray-600 font-mono">{identifier || "-"}</span>
                  </div>
                </div>

                {/* Groups / Services tabs */}
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-0 border-b border-gray-200 mb-3">
                    {(["groups", "services"] as const).map((tab) => {
                      const isActive = summaryTab === tab;
                      const count = tab === "groups" ? assignedGroupIds.size : assignedServices.size;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSummaryTab(tab)}
                          className={`px-3 py-2 text-[11px] cursor-pointer border-b-2 transition-colors uppercase tracking-wider ${
                            isActive
                              ? "border-gray-800 text-gray-800"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                          style={{ fontWeight: isActive ? 600 : 400 }}
                        >
                          {tab === "groups" ? "Grupos" : "Servicios"} ({count})
                        </button>
                      );
                    })}
                  </div>
                  <div className="min-h-[60px]">
                    {summaryTab === "groups" ? (
                      assignedGroupIds.size === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">No hay grupos seleccionados</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(assignedGroupIds).map((gid) => {
                            const g = allGroups.find((gr) => gr.id === gid);
                            return g ? (
                              <span key={gid} className="text-[11px] text-gray-600 border border-gray-200 px-1.5 py-0.5">
                                {g.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )
                    ) : (
                      assignedServices.size === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">No hay servicios seleccionados</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(assignedServices).map((s) => (
                            <span key={s} className="text-[11px] text-gray-600 border border-gray-200 px-1.5 py-0.5">
                              {s}
                            </span>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Form sections ── */}
          <div className="flex-1 min-w-0">

            {/* ── Datos personales ── */}
            <SectionCard title="Datos personales" icon={<Fingerprint size={15} className="text-gray-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                {/* Name */}
                <div>
                  <FieldLabel text="Nombre" required />
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(false); touch(); }}
                    placeholder="Nombre del usuario"
                    className={`${inputClass} ${nameError ? "!border-red-300 !bg-red-50/50" : ""}`}
                  />
                  <div className="min-h-[16px] mt-1">
                    {nameError && <span className="text-[11px] text-red-500">El nombre es obligatorio</span>}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <FieldLabel text="Tipo" tooltipKey="type" />
                  <select
                    value={userType}
                    onChange={(e) => { setUserType(e.target.value as UserType); touch(); }}
                    className={inputClass}
                  >
                    {userTypeOptions.map((t) => (
                      <option key={t} value={t}>{userTypeLabels[t]}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <FieldLabel text="Email" required tooltipKey="email" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(false); setEmailFormatError(false); touch(); }}
                    placeholder="usuario@empresa.com"
                    className={`${inputClass} ${emailError || emailFormatError ? "!border-red-300 !bg-red-50/50" : ""}`}
                  />
                  <div className="min-h-[16px] mt-1">
                    {emailError && <span className="text-[11px] text-red-500">El email es obligatorio</span>}
                    {emailFormatError && <span className="text-[11px] text-red-500">Formato de email invalido</span>}
                  </div>
                </div>

                {/* Identifier */}
                <div>
                  <FieldLabel text="Identificador" tooltipKey="identifier" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); touch(); }}
                    placeholder="Se genera automaticamente"
                    className={inputClass}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Secciones + Permisos (side by side) ── */}
            <SectionCard title="Accesos" icon={<Eye size={15} className="text-gray-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {/* Sections column */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[13px] text-gray-600" style={{ fontWeight: 600 }}>Secciones</span>
                    <TooltipIcon tooltipKey="sections" />
                  </div>
                  <div className="space-y-1">
                    {sectionLabels.map((s) => {
                      const isChild = !!s.parent;
                      const parentOff = isChild && !sections[s.parent!];
                      return (
                        <label
                          key={s.key}
                          className={`flex items-center gap-2.5 py-1.5 cursor-pointer ${isChild ? "ml-6" : ""} ${parentOff ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={sections[s.key]}
                            onChange={() => toggleSection(s.key)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-[13px] ${sections[s.key] ? "text-gray-700" : "text-gray-400"}`}>
                            {s.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Permissions column */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[13px] text-gray-600" style={{ fontWeight: 600 }}>Permisos</span>
                    <TooltipIcon tooltipKey="permissions" />
                  </div>
                  <div className="space-y-1">
                    {permissionLabels.map((p) => (
                      <label key={p.key} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[p.key]}
                          onChange={() => togglePermission(p.key)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className={`text-[13px] ${permissions[p.key] ? "text-gray-700" : "text-gray-400"}`}>
                          {p.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick toggle all */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    touch();
                    setSections({ ...defaultSections });
                    setPermissions({ ...defaultPermissions });
                  }}
                  className="text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Marcar todo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    touch();
                    const off: UserSections = {
                      dashboard: false, services: false, aiNode: false,
                      groupsAgentsTypifications: false, campaigns: false, conversations: false,
                      stats: false, statsDataReports: false, statsFlowAnalyzer: false,
                      vuiDesigner: false, users: false,
                    };
                    const offP: UserPermissions = {
                      vuiDesignerManagement: false, usersManagement: false,
                      recordingManagement: false, transcriptionsManagement: false,
                      spyOnConversations: false,
                    };
                    setSections(off);
                    setPermissions(offP);
                  }}
                  className="text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Desmarcar todo
                </button>
              </div>
            </SectionCard>

            {/* ── Grupos asignados ── */}
            <SectionCard
              title="Grupos"
              icon={<Users size={15} className="text-gray-400" />}
              headerExtra={
                <span className="text-[12px] text-gray-400">{assignedGroupIds.size} asignados</span>
              }
            >
              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Buscar grupo..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 text-[12px] focus:outline-none focus:border-gray-500 bg-white"
                />
              </div>

              {/* List */}
              <div className="max-h-[200px] overflow-y-auto border border-gray-200">
                {filteredGroups.length === 0 ? (
                  <div className="py-4 text-center text-[12px] text-gray-400">Sin resultados</div>
                ) : (
                  filteredGroups.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={assignedGroupIds.has(g.id)}
                        onChange={() => toggleGroup(g.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-[12px] ${assignedGroupIds.has(g.id) ? "text-gray-700" : "text-gray-500"}`} style={{ fontWeight: assignedGroupIds.has(g.id) ? 500 : 400 }}>
                        {g.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </SectionCard>

            {/* ── Servicios asignados ── */}
            <SectionCard
              title="Servicios"
              icon={<Settings size={15} className="text-gray-400" />}
              headerExtra={
                <span className="text-[12px] text-gray-400">{assignedServices.size} asignados</span>
              }
            >
              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 text-[12px] focus:outline-none focus:border-gray-500 bg-white"
                />
              </div>

              <div className="max-h-[200px] overflow-y-auto border border-gray-200">
                {filteredServices.length === 0 ? (
                  <div className="py-4 text-center text-[12px] text-gray-400">Sin resultados</div>
                ) : (
                  filteredServices.map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={assignedServices.has(s)}
                        onChange={() => toggleService(s)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-[12px] ${assignedServices.has(s) ? "text-gray-700" : "text-gray-500"}`} style={{ fontWeight: assignedServices.has(s) ? 500 : 400 }}>
                        {s}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </SectionCard>

            {/* ── Zona peligrosa (only in edit mode) — DD#303 consistent with Agents/Groups ── */}
            {isEdit && existingUser && (
              <div className="border border-red-200 bg-white mb-8">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <span
                      className="text-[13px] text-red-500"
                      style={{ fontWeight: 600 }}
                    >
                      Eliminar usuario
                    </span>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Esta acción no se puede deshacer. El usuario perderá acceso al sistema inmediatamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-red-500 border border-red-300 hover:bg-red-50 cursor-pointer shrink-0"
                    style={{ fontWeight: 500 }}
                  >
                    <Trash2 size={14} />
                    Eliminar usuario
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Discard dialog ── */}
      {blocker.state === "blocked" && (
        <DiscardDialog
          onStay={() => blocker.reset!()}
          onDiscard={() => blocker.proceed!()}
        />
      )}

      {/* ── Delete dialog ── */}
      {deleteDialogOpen && existingUser && (
        <DeleteEntityDialog
          type="single"
          items={[{ id: existingUser.id, name: existingUser.name }]}
          entitySingular="usuario"
          entityPlural="usuarios"
          singleDetailMessage="El usuario perdera acceso al sistema inmediatamente."
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteFromEdit}
        />
      )}
    </>
  );
}