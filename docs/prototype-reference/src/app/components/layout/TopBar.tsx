import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { HelpCircle, LogOut, Phone, User } from "lucide-react";
import { useClickOutside } from "../shared/useClickOutside";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[];
}

export function TopBar({ breadcrumbs }: TopBarProps) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setUserMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu, userMenuOpen);

  return (
    <header className="h-12 min-h-12 bg-white border-b border-gray-300 flex items-center justify-between px-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 text-[12px]">&gt;</span>}
            {crumb.path ? (
              <button
                onClick={() => navigate(crumb.path!)}
                className="text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                {crumb.label}
              </button>
            ) : i === breadcrumbs.length - 1 ? (
              <span className="text-gray-700" style={{ fontWeight: 500 }}>
                {crumb.label}
              </span>
            ) : (
              <span className="text-gray-400">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* User avatar */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-8 h-8 bg-gray-100 border border-gray-300 text-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-200"
        >
          <User size={15} />
        </button>

        {userMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-11 w-60 bg-white border border-gray-300 z-50 py-1"
            onKeyDown={(e) => { if (e.key === "Escape") setUserMenuOpen(false); }}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>
                Mario Supervisor
              </div>
              <div className="mt-1.5">
                <span className="text-[10px] text-gray-500 border border-gray-300 px-1.5 py-0.5" style={{ fontWeight: 500 }}>
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[12px] text-gray-400">
                <Phone size={12} />
                <span>+34 917 945 449</span>
              </div>
            </div>
            <div className="py-1">
              <button role="menuitem" className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer">
                <HelpCircle size={15} className="text-gray-400" />
                <span>Centro de ayuda</span>
              </button>
              <button role="menuitem" className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer">
                <LogOut size={15} className="text-gray-400" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}