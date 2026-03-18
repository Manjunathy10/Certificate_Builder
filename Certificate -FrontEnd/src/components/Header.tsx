import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "@/auth/store";

type HeaderProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSidebar: () => void;
};

function Header({
  isDarkMode,
  onToggleTheme,
  onOpenSidebar,
}: HeaderProps) {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate("/dashboard/profile");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto grid h-16 w-full max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-950 lg:hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="min-w-0 px-1 sm:px-2">
          <div className="relative mx-auto w-full max-w-[180px] sm:max-w-xs lg:max-w-md xl:max-w-xl">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-700 dark:focus:bg-gray-950"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="Open user menu"
            >
              <img
                src="https://i.pravatar.cc/40"
                alt={user?.name || "User avatar"}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[140px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.name || "User"}
                </p>
                <p className="max-w-[140px] truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "Signed in"}
                </p>
              </div>
              <ChevronDown size={16} className="hidden text-gray-400 md:block dark:text-gray-500" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;