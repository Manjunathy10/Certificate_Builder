import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
   UserPlus,
  Upload,
  List,
  Download,
  FileText,
  Trash2,
} from "lucide-react";
import { NavLink } from "react-router";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const navItems = [
    {
      label: "Home",
      to: "/dashboard",
      end: true,
      icon: LayoutDashboard,
    },
    // {
    //   label: "Profile",
    //   to: "/dashboard/profile",
    //   icon: UserCircle,
    // },


     {
    label: "Add Student",
    to: "/dashboard/students/add",
    icon: UserPlus,
  },
  {
    label: "Import Student",
    to: "/dashboard/students/import",
    icon: Upload,
  },
  {
    label: "Student List",
    to: "/dashboard/students/list",
    icon: List,
  },
  {
    label: "Export Student",
    to: "/dashboard/students/export",
    icon: Download,
  },
  {
    label: "Export Certificate",
    to: "/dashboard/certificates/export",
    icon: FileText,
  },
  {
    label: "Delete Certificate",
    to: "/dashboard/certificates/delete",
    icon: Trash2,
  }
  ];

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white text-gray-700 shadow-xl transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 lg:z-20 lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "w-16" : "w-[240px]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {isCollapsed ? (
          <div className="border-b border-gray-200 px-0 py-4 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-900">
                C
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:inline-flex"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
            <div className="min-w-0 pr-10">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Workspace
              </p>
              <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                Certificate Builder
              </h2>
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:inline-flex"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className={[
          "flex-1 overflow-y-auto py-4 transition-all duration-300 ease-in-out",
          isCollapsed ? "px-2" : "px-3",
        ].join(" ")}>
          <nav className="space-y-2">
            {navItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                aria-label={label}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out",
                    isCollapsed
                      ? "mx-auto h-11 w-11 justify-center items-center px-0"
                      : "h-11 gap-3 px-3",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm dark:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={20} strokeWidth={2} />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;