import { AudioLines, BookOpenText, Code2, MoonStar, SunMedium } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

const links = [
  { to: "/", label: "Input Mode", icon: AudioLines },
  { to: "/reverse", label: "Reverse", icon: Code2 },
  { to: "/reference", label: "Reference", icon: BookOpenText },
];

export default function AppShell({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel mb-6 flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Morse Studio
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Signal-first Morse workflows, built for speed.
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <nav className="flex flex-wrap gap-2">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100 shadow-lg shadow-cyan-950/40"
                        : "border-white/10 bg-white/5 text-[rgb(var(--muted))] hover:border-white/20 hover:bg-white/10 hover:text-[rgb(var(--text))]",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[rgb(var(--text))] transition hover:bg-white/10 md:self-auto"
            >
              {theme === "dark" ? (
                <SunMedium className="h-4 w-4 text-amber-300" />
              ) : (
                <MoonStar className="h-4 w-4 text-sky-600" />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
