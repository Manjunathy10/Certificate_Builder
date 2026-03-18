import { NavLink } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Award,
  Users,
  Settings
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Templates",
    icon: FileText,
    path: "/templates",
  },
  {
    name: "Certificates",
    icon: Award,
    path: "/certificates",
  },
  {
    name: "Students",
    icon: Users,
    path: "/students",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function Sidebar() {
  return (
    <div className="h-full w-64 border-r bg-card p-6 flex flex-col">

      <h2 className="text-2xl font-bold mb-10">Dashboard</h2>

      <nav className="flex flex-col gap-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}

export default Sidebar;