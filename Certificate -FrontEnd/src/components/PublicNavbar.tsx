import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Menu, X, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import useAuth from "@/auth/store";

function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  const isLoggedIn = checkLogin();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;

    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-400 font-bold text-white">
              C
            </div>
            <span className="text-lg">DEMO</span>
          </div>

          {!isLoggedIn ? (
            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              <NavLink to="#" className="transition hover:text-blue-600">
                Features
              </NavLink>
              <NavLink to="#" className="transition hover:text-blue-600">
                Solutions
              </NavLink>
              <NavLink to="#" className="transition hover:text-blue-600">
                Pricing
              </NavLink>
              <NavLink to="#" className="transition hover:text-blue-600">
                Resources
              </NavLink>
            </div>
          ) : (
            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              <NavLink to="/dashboard" className="transition hover:text-blue-600">
                Dashboard
              </NavLink>
              <NavLink to="/dashboard/certificates" className="transition hover:text-blue-600">
                Certificates
              </NavLink>
              <NavLink to="/dashboard/settings" className="transition hover:text-blue-600">
                Settings
              </NavLink>
            </div>
          )}

          <div className="hidden items-center gap-4 md:flex">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className="text-sm transition hover:text-blue-600">
                  Login
                </NavLink>

                <NavLink to="/signup">
                  <Button variant="outline" size="sm">
                    Sign up free
                  </Button>
                </NavLink>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{user?.name || "User"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <NavLink
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-gray-100 hover:text-red-700 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-md p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="flex flex-col gap-4 border-t border-gray-200 pb-6 pt-4 text-sm font-medium dark:border-gray-700 md:hidden">
            {!isLoggedIn ? (
              <>
                <NavLink to="#" className="transition hover:text-blue-600">
                  Features
                </NavLink>
                <NavLink to="#" className="transition hover:text-blue-600">
                  Solutions
                </NavLink>
                <NavLink to="#" className="transition hover:text-blue-600">
                  Pricing
                </NavLink>
                <NavLink to="#" className="transition hover:text-blue-600">
                  Resources
                </NavLink>

                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

                <NavLink to="/login" className="transition hover:text-blue-600">
                  Login
                </NavLink>

                <NavLink to="/signup">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign up free
                  </Button>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className="transition hover:text-blue-600">
                  Dashboard
                </NavLink>
                <NavLink to="/dashboard/certificates" className="transition hover:text-blue-600">
                  Certificates
                </NavLink>
                <NavLink to="/dashboard/settings" className="transition hover:text-blue-600">
                  Settings
                </NavLink>

                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 text-left text-red-600 transition hover:text-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}

            <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm transition hover:text-blue-600"
            >
              {theme === "light" ? (
                <>
                  <Moon size={16} />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={16} />
                  Light Mode
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default PublicNavbar;