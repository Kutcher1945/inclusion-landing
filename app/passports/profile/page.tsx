import { requireSession } from "@/lib/auth/dal";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Профиль — Паспортизация" };

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground mb-1">Профиль</h1>
      <p className="text-sm text-foreground/40 mb-6">Личные данные и смена пароля</p>
      <ProfileForm user={user} />
    </div>
  );
}
