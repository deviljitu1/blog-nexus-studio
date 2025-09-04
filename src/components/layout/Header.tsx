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
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-card">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <Edit3 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-serif font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">ModernBlog</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`relative text-sm font-medium transition-all duration-300 py-2 px-1 group ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${
                isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              } origin-left`} />
            </Link>
          ))}
        </nav>

        {/* Search and Auth */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="w-64 pr-10 bg-muted/50 border-border/50 focus:border-primary/50"
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Search className="h-4 w-4" />
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
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex hover:bg-primary/10 hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                    Account
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                  className="hover:bg-destructive hover:text-destructive-foreground border-border/50"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="default" className="shadow-glow">
                  Login
                </Button>
              </Link>
            )}
          </div>
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden hover:bg-primary/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur">
              <div className="flex flex-col space-y-6 mt-8">
                <div className="text-center pb-4 border-b border-border/50">
                  <h3 className="font-serif font-bold text-lg">Navigation</h3>
                </div>
                
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-lg font-medium transition-all duration-300 py-3 px-4 rounded-lg ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10 shadow-card"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-border/50 space-y-4">
                  <form onSubmit={handleSearchSubmit}>
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      className="bg-muted/50 border-border/50"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </form>
                  
                  {session ? (
                    <div className="space-y-3">
                      <Link to="/profile" className="block">
                        <Button className="w-full" variant="outline">
                          Account Settings
                        </Button>
                      </Link>
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={async () => {
                          await supabase.auth.signOut();
                          navigate("/");
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link to="/auth" className="block">
                      <Button className="w-full shadow-glow">
                        Login
                      </Button>
                    </Link>
                  )}
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