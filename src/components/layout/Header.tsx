import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { useSearch } from "@/hooks/useSearch";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { suggestions, hasResults } = useSearch(searchQuery);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(query.length >= 2);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/articles" },
    { name: "Categories", href: "/articles" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(session ? [] : [{ name: "Login", href: "/auth" }]),
  ];
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Edit3 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-serif font-bold">ModernBlog</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="w-64 pr-8"
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                  <SearchDropdown
                    suggestions={suggestions}
                    isOpen={showSuggestions && hasResults}
                    query={searchQuery}
                    onClose={() => setShowSuggestions(false)}
                  />
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
{session ? (
  <Button
    size="sm"
    variant="outline"
    onClick={async () => {
      await supabase.auth.signOut();
      navigate("/");
    }}
  >
    Sign out
  </Button>
) : (
  <Link to="/auth">
    <Button size="sm" variant="outline">Login</Button>
  </Link>
)}
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <form onSubmit={handleSearchSubmit}>
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      className="mb-4"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;