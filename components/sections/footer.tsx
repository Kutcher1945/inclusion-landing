import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #29358f, #3772ff)" }}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Инклюзия</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-5">
              Платформа мониторинга доступности городской инфраструктуры для людей с инвалидностью в городе Алматы.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400">
                Казахстан
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400">
                Алматы
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-green-900 text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Активна
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 mb-4">Платформа</h4>
            <ul className="space-y-2.5">
              {[
                ["#features", "Возможности"],
                ["#how", "Как работает"],
                ["#analytics", "Аналитика"],
                ["#map", "Карта"],
                ["#cta", "Запросить доступ"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@inclusion.kz"
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  info@inclusion.kz
                </a>
              </li>
              <li>
                <a
                  href="tel:+77272000000"
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +7 (727) 200-00-00
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>г. Алматы, пр. Абая 1,<br />Акимат города Алматы</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} ИС «Инклюзия». Все права защищены.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <span>Разработано для Акимата города Алматы</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
