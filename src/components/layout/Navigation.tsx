import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Home, Library, LogIn, LogOut, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/resources", label: "Resources", icon: Library },
  { to: "/mock-tests", label: "Mock Tests", icon: GraduationCap },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

export function TopNav() {
  const isActive = useActive();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-5 md:flex">
      <nav
        aria-label="Main navigation"
        className="clay pointer-events-auto flex items-center gap-1 rounded-full px-3 py-2 backdrop-blur"
      >
        <Link to="/" className="mr-2 flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="grid size-8 place-items-center rounded-2xl bg-primary/30 text-sm font-bold">
            U
          </span>
          <span className="text-sm font-bold tracking-tight">UPSC Clay</span>
        </Link>
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive(to)
                ? "bg-primary/30 shadow-[var(--clay-shadow-sm)]"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
        <AuthControl />
      </nav>
    </header>
  );
}

function AuthControl() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;

  if (!signedIn) {
    return (
      <Link
        to="/auth"
        className="ml-1 flex items-center gap-2 rounded-full bg-primary/30 px-4 py-2 text-sm font-semibold shadow-[var(--clay-shadow-sm)]"
      >
        <LogIn className="size-4" aria-hidden="true" />
        Sign in
      </Link>
    );
  }

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        navigate({ to: "/auth", replace: true });
      }}
      className="ml-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </button>
  );
}

export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Mobile navigation"
      className="clay fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-0.5 rounded-[28px] px-2 py-2 md:hidden"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          aria-label={label}
          className={cn(
            "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 py-1.5 text-[0.6rem] font-medium transition-all duration-200",
            isActive(to)
              ? "bg-primary/30 shadow-[var(--clay-shadow-sm)]"
              : "text-muted-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}