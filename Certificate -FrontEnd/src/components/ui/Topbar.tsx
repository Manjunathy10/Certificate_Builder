import { Search, Bell } from "lucide-react";

function Topbar() {
  return (
    <div className="h-16 border-b bg-card flex items-center justify-between px-6">

      <div className="flex items-center gap-3 bg-muted px-3 py-1 rounded-lg">
        <Search size={18} />
        <input
          placeholder="Search..."
          className="bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell size={20} />

        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm">manjunath</span>
        </div>
      </div>

    </div>
  );
}

export default Topbar;