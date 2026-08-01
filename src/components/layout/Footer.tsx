import { Link } from "@tanstack/react-router";

const links = [
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
  { to: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="mx-auto mt-20 w-full max-w-6xl px-4 pb-28 md:pb-12">
      <div className="clay flex flex-col items-center gap-5 rounded-[32px] px-6 py-8 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-base font-bold tracking-tight">UPSC Clay</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A calmer way to prepare for the Civil Services Examination.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UPSC Clay. Study data is stored privately on your device.
      </p>
    </footer>
  );
}