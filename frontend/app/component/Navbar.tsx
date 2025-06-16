"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onSearch?: (query: string) => void;
  initialSearchQuery?: string;
}

const Navbar = ({ onSearch, initialSearchQuery = "" }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default search behavior
      router.push(`/recipes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="relative bg-gradient-to-r from-amber-800 via-amber-800 to-orange-800 shadow-lg border-b border-amber-600/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-3 text-2xl font-bold text-amber-100 hover:text-white transition-colors duration-200"
              >
                <ChefHat className="w-8 h-8 text-amber-200" />
                <span>CookMate</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/homepage"
                    className="rounded-md px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-700 transition-colors duration-200"
                  >
                    All Recipes
                  </Link>
                  <Link
                    href="/recipes/create"
                    className="rounded-md px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-700 transition-colors duration-200"
                  >
                    Create Recipe
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="flex items-center space-x-2 focus:outline-none rounded-md px-3 py-2 hover:bg-amber-700 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center overflow-hidden">
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-amber-100">
                        {user?.name || 'User'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-amber-200 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-amber-800/95 backdrop-blur-sm py-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-amber-100 hover:bg-amber-700 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            router.push("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-amber-100 hover:bg-amber-700 transition-colors duration-200"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="rounded-md px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-700 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-amber-200 hover:bg-amber-700 hover:text-white focus:outline-none transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full rounded-md py-2 px-4 pl-10 bg-amber-700/80 text-amber-100 placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-2.5">
                <Search className="h-5 w-5 text-amber-300" />
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <Link
              href="/homepage"
              className="block rounded-md px-3 py-2 text-base font-medium text-amber-100 hover:bg-amber-700"
            >
              All Recipes
            </Link>

            <Link
              href="/recipes/create"
              className="block rounded-md px-3 py-2 text-base font-medium text-amber-100 hover:bg-amber-700"
            >
              Create Recipes
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="block rounded-md px-3 py-2 text-base font-medium text-amber-100 hover:bg-amber-700"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push("/auth");
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-amber-100 hover:bg-amber-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="block rounded-md px-3 py-2 text-base font-medium text-amber-100 hover:bg-amber-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="block rounded-md bg-amber-600 px-3 py-2 text-base font-medium text-white hover:bg-amber-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;