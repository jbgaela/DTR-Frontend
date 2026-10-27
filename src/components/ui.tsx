import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X, XCircle } from "lucide-react";

export const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-[0_1px_2px_rgb(37_99_217/25%),0_6px_16px_rgb(37_99_217/18%)] hover:bg-brand-strong",
  secondary: "border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas",
  ghost: "text-muted hover:bg-canvas hover:text-ink",
  danger: "bg-danger text-white shadow-[0_1px_2px_rgb(192_52_52/25%),0_6px_16px_rgb(192_52_52/15%)] hover:bg-[#a72b2b]",
  "danger-soft": "border border-danger/20 bg-danger-soft text-danger hover:bg-[#fbe4e4]"
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-[13px]",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = ({ variant = "primary", size = "md", loading = false, icon, className, children, disabled, type = "button", ...props }: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      buttonVariants[variant],
      buttonSizes[size],
      className
    )}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : icon}
    {children}
  </button>
);

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon: ReactNode;
  loading?: boolean;
};

export const IconButton = ({ label, variant = "ghost", size = "md", icon, loading = false, className, disabled, type = "button", ...props }: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      "inline-grid place-items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      size === "sm" ? "size-8" : "size-10",
      buttonVariants[variant],
      className
    )}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : icon}
  </button>
);

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={cn("min-w-0 rounded-2xl border border-line bg-surface p-5 surface-shadow sm:p-6", className)}>{children}</section>
);

export const CardHeader = ({ title, description, action, headingLevel = 2, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; headingLevel?: 2 | 3; className?: string }) => {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <Heading className="text-[15px] font-semibold tracking-[-.01em] text-ink">{title}</Heading>
        {description && <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const PageHeader = ({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand">{eyebrow}</p>}
      <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-[-.035em] text-ink sm:text-[30px]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border-line bg-canvas text-muted",
  info: "border-brand/15 bg-brand-soft text-brand",
  success: "border-success/15 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/15 bg-danger-soft text-danger",
  brand: "border-brand/15 bg-brand-soft text-brand"
};

export const Badge = ({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", badgeTones[tone], className)}>{children}</span>
);

export const MetricCard = ({ label, value, unit, hint, icon, tone = "brand", className }: { label: string; value: ReactNode; unit?: string; hint?: ReactNode; icon: ReactNode; tone?: BadgeTone; className?: string }) => {
  const iconTone = {
    neutral: "bg-canvas text-muted",
    info: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    brand: "bg-brand-soft text-brand"
  }[tone];
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4 surface-shadow sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", iconTone)} aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-1 text-[28px] font-semibold tracking-[-.04em] text-ink tabular">
        {value}
        {unit && <span className="text-sm font-medium tracking-normal text-muted">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
};

export const ProgressBar = ({ value, label, tone = "success", className }: { value: number; label: string; tone?: "success" | "brand" | "warning"; className?: string }) => {
  const percent = Math.max(0, Math.min(100, value));
  const fill = { success: "bg-success", brand: "bg-brand", warning: "bg-warning" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-canvas", className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
      <div className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", fill)} style={{ width: `${percent}%` }} />
    </div>
  );
};

export const ProgressRing = ({ value, label, size = 104 }: { value: number; label: string; size?: number }) => {
  const percent = Math.max(0, Math.min(100, value));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="size-full -rotate-90" viewBox="0 0 96 96" role="img" aria-label={`${label}: ${Math.round(percent)}%`}>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="var(--color-success)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute text-xl font-semibold tracking-[-.04em] text-ink tabular" aria-hidden="true">{Math.round(percent)}%</span>
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action, className }: { icon: ReactNode; title: string; description: ReactNode; action?: ReactNode; className?: string }) => (
  <div className={cn("grid place-items-center rounded-xl border border-dashed border-line bg-canvas/60 px-6 py-10 text-center", className)}>
    <span className="grid size-11 place-items-center rounded-xl bg-surface text-muted surface-shadow" aria-hidden="true">{icon}</span>
    <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
    <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-lg bg-line/70 motion-reduce:animate-none", className)} aria-hidden="true" />;

export const PageSkeleton = () => (
  <div className="space-y-5" role="status" aria-live="polite" aria-busy="true" aria-label="Loading content">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Skeleton className="h-52" />
      <Skeleton className="h-52" />
    </div>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const alertTones = {
  info: { wrapper: "border-brand/15 bg-brand-soft text-brand", icon: <Info className="size-4" aria-hidden="true" /> },
  success: { wrapper: "border-success/15 bg-success-soft text-success", icon: <CheckCircle2 className="size-4" aria-hidden="true" /> },
  warning: { wrapper: "border-warning/20 bg-warning-soft text-warning", icon: <AlertTriangle className="size-4" aria-hidden="true" /> },
  danger: { wrapper: "border-danger/15 bg-danger-soft text-danger", icon: <XCircle className="size-4" aria-hidden="true" /> }
};

export const InlineAlert = ({ tone = "info", title, children, action, onDismiss, className }: { tone?: keyof typeof alertTones; title?: ReactNode; children?: ReactNode; action?: ReactNode; onDismiss?: () => void; className?: string }) => (
  <div
    className={cn("flex items-start gap-3 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed", alertTones[tone].wrapper, className)}
    role={tone === "danger" || tone === "warning" ? "alert" : "status"}
  >
    <span className="mt-0.5 shrink-0">{alertTones[tone].icon}</span>
    <div className="min-w-0 flex-1">
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn(Boolean(title) && "mt-0.5")}>{children}</div>}
      {action && <div className="mt-2.5">{action}</div>}
    </div>
    {onDismiss && <button type="button" onClick={onDismiss} className="ml-1 shrink-0 rounded-md p-1 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current" aria-label="Dismiss message"><X className="size-4" aria-hidden="true" /></button>}
  </div>
);

const controlClass = "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-[0_1px_1px_rgb(16_36_61/3%)] outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted";

type FieldMeta = {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  controlClassName?: string;
};

const describedBy = (hintId: string | undefined, errorId: string | undefined) => [hintId, errorId].filter(Boolean).join(" ") || undefined;

const FieldShell = ({ label, hint, error, required, className, htmlFor, hintId, errorId, children }: FieldMeta & { htmlFor: string; hintId?: string; errorId?: string; children: ReactNode }) => (
  <div className={cn("grid gap-1.5", className)}>
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
      {label}
      {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
    </label>
    {children}
    {hint && !error && <p id={hintId} className="text-xs leading-relaxed text-muted">{hint}</p>}
    {error && <p id={errorId} className="text-xs font-medium leading-relaxed text-danger" role="alert">{error}</p>}
  </div>
);

export const TextField = ({ label, hint, error, required, className, controlClassName, id, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldMeta) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} htmlFor={fieldId} hintId={hintId} errorId={errorId}>
      <input id={fieldId} className={cn(controlClass, error && "border-danger focus:border-danger focus:ring-danger/10", controlClassName)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hintId, errorId)} aria-required={required || undefined} {...props} />
    </FieldShell>
  );
};

export const SelectField = ({ label, hint, error, required, className, controlClassName, id, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & FieldMeta) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} htmlFor={fieldId} hintId={hintId} errorId={errorId}>
      <select id={fieldId} className={cn(controlClass, "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", error && "border-danger focus:border-danger focus:ring-danger/10", controlClassName)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hintId, errorId)} aria-required={required || undefined} {...props}>{children}</select>
    </FieldShell>
  );
};

export const TextareaField = ({ label, hint, error, required, className, controlClassName, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldMeta) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} htmlFor={fieldId} hintId={hintId} errorId={errorId}>
      <textarea id={fieldId} className={cn(controlClass, "resize-y leading-relaxed", error && "border-danger focus:border-danger focus:ring-danger/10", controlClassName)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hintId, errorId)} aria-required={required || undefined} {...props} />
    </FieldShell>
  );
};

export const CheckboxField = ({ label, hint, id, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode }) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input id={fieldId} type="checkbox" className="mt-0.5 size-4 shrink-0 rounded border-line text-brand accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" {...props} />
      <div className="grid gap-0.5">
        <label htmlFor={fieldId} className="text-[13px] font-medium leading-snug text-ink">{label}</label>
        {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
      </div>
    </div>
  );
};

export const Avatar = ({ name, size = "md", className, decorative = true }: { name: string; size?: "sm" | "md" | "lg"; className?: string; decorative?: boolean }) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = !parts.length ? "?" : parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  const sizes = { sm: "size-8 text-[11px]", md: "size-10 text-xs", lg: "size-11 text-sm" };
  return <span className={cn("grid shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand", sizes[size], className)} aria-hidden={decorative ? true : undefined}>{value}</span>;
};
