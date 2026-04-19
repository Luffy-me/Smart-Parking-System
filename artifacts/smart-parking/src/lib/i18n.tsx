import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "ru";

const DICT = {
  en: {
    appName: "Parq",
    operator: "Operator",
    admin: "Admin",
    nav: {
      dashboard: "Dashboard",
      map: "Live Map",
      reservations: "Reservations",
      vehicles: "Vehicles",
      transactions: "Transactions",
      spots: "Spots Admin",
    },
    pages: {
      dashboardTitle: "Dashboard",
      dashboardSubtitle: "Live parking operations overview.",
      mapTitle: "Live Map",
      mapSubtitle: "Real-time occupancy and spot management.",
      reservationsTitle: "Reservations",
      reservationsSubtitle: "Manage upcoming, active, and past bookings.",
      vehiclesTitle: "Vehicles",
      vehiclesSubtitle: "Registered vehicles and their owners.",
      transactionsTitle: "Transactions",
      transactionsSubtitle: "Payment history and revenue records.",
      spotsTitle: "Spots Admin",
      spotsSubtitle: "Configure parking spots and pricing.",
    },
    metrics: {
      revenueToday: "Total Revenue Today",
      utilization: "Spot Utilization",
      activeReservations: "Active Reservations",
      registeredVehicles: "Registered Vehicles",
      revenueTrend: "Revenue Trend (Last 7 Days)",
      recentActivity: "Recent Activity",
    },
    common: {
      allZones: "All Zones",
      allStatuses: "All Statuses",
      zone: "Zone",
      status: "Status",
      available: "Available",
      occupied: "Occupied",
      reserved: "Reserved",
      maintenance: "Maintenance",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      search: "Search",
      language: "Language",
      theme: "Theme",
      darkMode: "Dark mode",
      lightMode: "Light mode",
    },
  },
  ru: {
    appName: "Парк",
    operator: "Оператор",
    admin: "Администратор",
    nav: {
      dashboard: "Панель",
      map: "Карта",
      reservations: "Бронирования",
      vehicles: "Автомобили",
      transactions: "Платежи",
      spots: "Парковочные места",
    },
    pages: {
      dashboardTitle: "Панель управления",
      dashboardSubtitle: "Обзор операций парковки в реальном времени.",
      mapTitle: "Карта парковки",
      mapSubtitle: "Загруженность и управление местами в реальном времени.",
      reservationsTitle: "Бронирования",
      reservationsSubtitle: "Управление предстоящими, активными и прошлыми бронями.",
      vehiclesTitle: "Автомобили",
      vehiclesSubtitle: "Зарегистрированные автомобили и их владельцы.",
      transactionsTitle: "Платежи",
      transactionsSubtitle: "История платежей и доходов.",
      spotsTitle: "Управление местами",
      spotsSubtitle: "Настройка парковочных мест и тарифов.",
    },
    metrics: {
      revenueToday: "Выручка за сегодня",
      utilization: "Загруженность",
      activeReservations: "Активные брони",
      registeredVehicles: "Автомобили в системе",
      revenueTrend: "Динамика выручки (7 дней)",
      recentActivity: "Последние события",
    },
    common: {
      allZones: "Все зоны",
      allStatuses: "Все статусы",
      zone: "Зона",
      status: "Статус",
      available: "Свободно",
      occupied: "Занято",
      reserved: "Забронировано",
      maintenance: "Обслуживание",
      cancel: "Отмена",
      confirm: "Подтвердить",
      back: "Назад",
      next: "Далее",
      search: "Поиск",
      language: "Язык",
      theme: "Тема",
      darkMode: "Тёмная тема",
      lightMode: "Светлая тема",
    },
  },
} as const;

type Dict = (typeof DICT)["en"];

type PathInto<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? PathInto<T[K], `${P}${K}.`>
    : `${P}${K}`;
}[keyof T & string];

export type TranslationKey = PathInto<Dict>;

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "parq.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "ru" ? "ru" : "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === "en" ? "ru" : "en"));

  const t = (key: TranslationKey): string => {
    const parts = key.split(".");
    let node: unknown = DICT[lang];
    for (const part of parts) {
      if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof node === "string" ? node : key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
