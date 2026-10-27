import { useState } from "react";
import { CalendarCheck2, Eye, EyeOff, FileSpreadsheet, ListChecks, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, TextField } from "../components/ui";
import { messages as m } from "../constants/messages";

type LoginViewProps = {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string;
  onClearError?: () => void;
};

export const LoginView = ({ onLogin, loading, error, onClearError }: LoginViewProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = async () => {
    setLocalError("");
    if (!username.trim() || !password) {
      setLocalError("Enter your username and password to continue.");
      return;
    }
    await onLogin(username.trim(), password);
  };

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <section className="relative hidden overflow-hidden bg-sidebar px-10 py-12 text-white lg:flex lg:flex-col xl:px-16">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[460px] rounded-full bg-[radial-gradient(circle,rgb(64_128_255/28%)_0,transparent_68%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(31_196_159/16%)_0,transparent_68%)]" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#5c96ff] to-brand text-lg font-semibold text-white shadow-[0_10px_24px_rgb(0_0_0/18%)]">D</span>
          <span>
            <strong className="block text-sm font-semibold text-white">{m.appName}</strong>
            <span className="mt-0.5 block text-[11px] text-sidebar-text">Attendance & accomplishments</span>
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-[510px] py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#8bb6ff]">Your workday, clearly recorded</p>
          <h1 className="mt-4 text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-[1.04] tracking-[-.055em] text-white">Track your time.<br />Build your goals.</h1>
          <p className="mt-5 max-w-[430px] text-[15px] leading-relaxed text-sidebar-text">One calm workspace for daily attendance, accomplishments, leave, and the company workbooks you send every cutoff.</p>

          <ul className="mt-9 grid gap-3.5 text-sm text-[#c7d5e8]">
            {[
              { icon: <ClockIcon />, label: "Attendance tracking with server-calculated hours" },
              { icon: <ListChecks className="size-4" aria-hidden="true" />, label: "Task and accomplishment records in one place" },
              { icon: <CalendarCheck2 className="size-4" aria-hidden="true" />, label: "Leave requests tied to the active period" },
              { icon: <FileSpreadsheet className="size-4" aria-hidden="true" />, label: "DTR and accomplishment workbook exports" }
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#9dc3ff]">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-sidebar-text">
          <ShieldCheck className="size-4 text-[#7ee2c0]" aria-hidden="true" />
          Secure access to your personal workspace
        </div>
      </section>

      <section className="flex flex-col px-4 py-6 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="grid size-9 place-items-center rounded-lg bg-brand text-base font-semibold text-white">D</span>
          <span className="text-sm font-semibold text-ink">{m.appName}</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[430px]">
            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand">Welcome back</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-.045em] text-ink">Sign in to your workspace</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Continue recording attendance, reviewing totals, and preparing your cutoff exports.</p>
            </div>

            <form
              className="rounded-2xl border border-line bg-surface p-5 surface-shadow sm:p-7"
              onSubmit={(event) => { event.preventDefault(); void submit(); }}
              noValidate
            >
              <div className="grid gap-4">
                <TextField
                  label={m.username}
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => { setUsername(event.target.value); setLocalError(""); onClearError?.(); }}
                  disabled={loading}
                  placeholder="Enter your username"
                  required
                />
                <div className="relative">
                  <TextField
                    label={m.password}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setLocalError(""); onClearError?.(); }}
                    disabled={loading}
                    placeholder="Enter your password"
                    required
                    className="[&_input]:pr-11"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-[1.9rem] grid size-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {(localError || error) && (
                <p className="mt-4 rounded-lg border border-danger/15 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-danger" role="alert">
                  {localError || error}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-5 w-full" loading={loading} icon={<LockKeyhole className="size-4" aria-hidden="true" />}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
                <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
                Your session is protected with a secure cookie.
              </p>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-muted">Contact your administrator if you cannot access your account.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

const ClockIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);
