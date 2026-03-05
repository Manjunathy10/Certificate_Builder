import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Menu, X, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import useAuth from "@/auth/store";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  const isLoggedIn = checkLogin();

  // Close dropdown when clicking outside
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
    <nav className="sticky top-0 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-700 z-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-lg">DEMO</span>
          </div>

          {/* Desktop Menu - Conditional based on auth state */}
          {!isLoggedIn ? (
            // Public Navigation
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <NavLink to="#" className="hover:text-blue-600 transition">Features</NavLink>
              <NavLink to="#" className="hover:text-blue-600 transition">Solutions</NavLink>
              <NavLink to="#" className="hover:text-blue-600 transition">Pricing</NavLink>
              <NavLink to="#" className="hover:text-blue-600 transition">Resources</NavLink>
            </div>
          ) : (
            // Dashboard Navigation (when logged in)
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <NavLink to="/dashboard" className="hover:text-blue-600 transition">Dashboard</NavLink>
              <NavLink to="/templates" className="hover:text-blue-600 transition">Templates</NavLink>
              <NavLink to="/certificates" className="hover:text-blue-600 transition">Certificates</NavLink>
            </div>
          )}

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className="text-sm hover:text-blue-600 transition">
                  Login
                </NavLink>

                <NavLink to="/signup">
                  <Button variant="outline" size="sm">
                    Sign up free
                  </Button>
                </NavLink>
              </>
            ) : (
              // User Dropdown Menu
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium"
                >
                  <span>{user?.name || "User"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <NavLink
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu - Conditional based on auth state */}
        {open && (
          <div className="md:hidden flex flex-col gap-4 pb-6 pt-4 text-sm font-medium border-t border-gray-200 dark:border-gray-700">
            {!isLoggedIn ? (
              <>
                {/* Public Navigation Links for Mobile */}
                <NavLink to="#" className="hover:text-blue-600 transition">
                  Features
                </NavLink>
                <NavLink to="#" className="hover:text-blue-600 transition">
                  Solutions
                </NavLink>
                <NavLink to="#" className="hover:text-blue-600 transition">
                  Pricing
                </NavLink>
                <NavLink to="#" className="hover:text-blue-600 transition">
                  Resources
                </NavLink>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <NavLink to="/login" className="hover:text-blue-600 transition">
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
                {/* Dashboard Navigation Links for Mobile */}
                <NavLink to="/dashboard" className="hover:text-blue-600 transition">
                  Dashboard
                </NavLink>
                <NavLink to="/templates" className="hover:text-blue-600 transition">
                  Templates
                </NavLink>
                <NavLink to="/certificates" className="hover:text-blue-600 transition">
                  Certificates
                </NavLink>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <NavLink to="/profile" className="hover:text-blue-600 transition">
                  Profile
                </NavLink>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 text-left hover:text-red-600 transition text-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm hover:text-blue-600 transition"
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

export default Navbar;