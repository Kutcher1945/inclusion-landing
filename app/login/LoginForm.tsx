"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type LoginCredentials, loginCredentialsSchema } from "@/lib/auth/schemas";

type Props = {
  redirectTo: string;
};

type ServerError = "invalid_credentials" | "not_staff" | "upstream_error" | null;

const ERROR_MESSAGES: Record<NonNullable<ServerError>, string> = {
  invalid_credentials: "Неверное имя пользователя или пароль",
  not_staff: "Доступ разрешён только для сотрудников",
  upstream_error: "Ошибка сервера. Повторите попытку позже.",
};

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "https://green-admin.smartalmaty.kz";

export function LoginForm({ redirectTo }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<ServerError>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({ resolver: zodResolver(loginCredentialsSchema) });

  async function onSubmit(credentials: LoginCredentials) {
    setServerError(null);
    try {
      // Call Django directly from the browser (same internal network as the backend)
      const tokenRes = await fetch(`${BACKEND}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (tokenRes.status === 401) { setServerError("invalid_credentials"); return; }
      if (!tokenRes.ok)            { setServerError("upstream_error"); return; }

      const { access, refresh } = await tokenRes.json() as { access: string; refresh: string };

      // Verify is_staff directly from Django
      const meRes = await fetch(`${BACKEND}/inclusion-api/admin/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!meRes.ok) { setServerError("upstream_error"); return; }
      const user = await meRes.json() as { is_staff?: boolean };
      if (!user.is_staff) { setServerError("not_staff"); return; }

      // Ask Next.js to store the tokens as httpOnly cookies (no Django call here)
      const sessionRes = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access, refresh }),
      });
      if (!sessionRes.ok) { setServerError("upstream_error"); return; }

      router.push(redirectTo);
    } catch {
      setServerError("upstream_error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-foreground">
          Имя пользователя
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          {...register("username")}
          aria-describedby={errors.username ? "username-error" : undefined}
          className={cn(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
            "placeholder:text-foreground/30 bg-surface text-foreground",
            "focus:border-brand focus:ring-2 focus:ring-brand/20",
            errors.username
              ? "border-red-400 ring-2 ring-red-100"
              : "border-foreground/15 hover:border-foreground/30",
          )}
          placeholder="Имя пользователя"
        />
        {errors.username && (
          <p id="username-error" className="text-xs text-red-500" role="alert">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={cn(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
            "placeholder:text-foreground/30 bg-surface text-foreground",
            "focus:border-brand focus:ring-2 focus:ring-brand/20",
            errors.password
              ? "border-red-400 ring-2 ring-red-100"
              : "border-foreground/15 hover:border-foreground/30",
          )}
          placeholder="••••••••"
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-red-500" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {ERROR_MESSAGES[serverError]}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white",
          "transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 active:opacity-80",
        )}
      >
        {isSubmitting ? "Выполняется вход…" : "Войти"}
      </button>
    </form>
  );
}
