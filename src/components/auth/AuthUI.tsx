"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink placeholder-muted outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl shadow-ink/10 sm:p-8">
        <h1 className="text-center text-2xl font-bold text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
    </div>
  );
}

export function FormAlert({
  kind = "error",
  children,
}: {
  kind?: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    kind === "error"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-success/40 bg-success/10 text-success";
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg border p-3 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      <input id={inputId} className={inputClass} {...props} />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function PasswordField({
  label,
  hint,
  id,
  labelAside,
  ...props
}: FieldProps & { labelAside?: ReactNode }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-ink/80">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`${inputClass} pr-16`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted transition hover:text-accent-text"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  loadingText,
}: {
  loading: boolean;
  children: ReactNode;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-lg bg-accent py-2.5 font-semibold text-accent-ink transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingText : children}
    </button>
  );
}

export function Divider({ children = "or" }: { children?: ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function GoogleButton({
  onClick,
  disabled,
  label = "Continue with Google",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface py-2.5 text-sm font-medium text-ink transition hover:border-accent/60 hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
        <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
      </svg>
      {label}
    </button>
  );
}
