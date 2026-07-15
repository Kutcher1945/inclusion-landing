"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { CurrentUser } from "@/lib/auth/backend";

type Props = { user: CurrentUser };

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-foreground border border-foreground/15 rounded-xl bg-surface " +
  "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 placeholder:text-foreground/30 transition disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "block text-xs font-medium text-foreground/50 mb-1.5";

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1.5">{message}</p>;
}

function SaveButton({ pending, success, label }: { pending: boolean; success: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: pending ? "#5d8bff" : "#3772ff" }}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : null}
      {pending ? "Сохранение…" : success ? "Сохранено" : label}
    </button>
  );
}

export function ProfileForm({ user }: Props) {
  const router = useRouter();

  // ── Profile info ──────────────────────────────────────────────
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [infoPending, setInfoPending] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoPending(true);
    setInfoError(null);
    setInfoSuccess(false);

    try {
      const res = await fetch("/passports/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfoError(data.detail ?? "Не удалось сохранить изменения.");
        return;
      }
      setInfoSuccess(true);
      router.refresh();
      setTimeout(() => setInfoSuccess(false), 2000);
    } catch {
      setInfoError("Не удалось подключиться к серверу.");
    } finally {
      setInfoPending(false);
    }
  }

  // ── Password change ──────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwPending, setPwPending] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("Новые пароли не совпадают.");
      return;
    }

    setPwPending(true);
    try {
      const res = await fetch("/passports/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwError(data.detail ?? "Не удалось изменить пароль.");
        return;
      }
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 2000);
    } catch {
      setPwError("Не удалось подключиться к серверу.");
    } finally {
      setPwPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="bg-surface rounded-2xl border border-foreground/8 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white text-base font-bold ring-1 ring-white/15"
            style={{ background: "linear-gradient(135deg, #3772ff, #6aa3ff)", boxShadow: "0 2px 8px rgba(55,114,255,0.4)" }}
          >
            {user.username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{user.username}</div>
            <div className="inline-flex items-center gap-1 text-xs text-foreground/40 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Сотрудник
            </div>
          </div>
        </div>

        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="first_name">Имя</label>
              <input
                id="first_name"
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Имя"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="last_name">Фамилия</label>
              <input
                id="last_name"
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="username">Логин</label>
            <input id="username" className={inputClass} value={user.username} disabled />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <FieldError message={infoError} />

          <SaveButton pending={infoPending} success={infoSuccess} label="Сохранить" />
        </form>
      </div>

      {/* Password change card */}
      <div className="bg-surface rounded-2xl border border-foreground/8 p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Смена пароля</h2>
        <p className="text-xs text-foreground/40 mb-5">Введите текущий пароль и новый</p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="current_password">Текущий пароль</label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="new_password">Новый пароль</label>
              <input
                id="new_password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="confirm_password">Повторите пароль</label>
              <input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <FieldError message={pwError} />

          <SaveButton pending={pwPending} success={pwSuccess} label="Изменить пароль" />
        </form>
      </div>
    </div>
  );
}
