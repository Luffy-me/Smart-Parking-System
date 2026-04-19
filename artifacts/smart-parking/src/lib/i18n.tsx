import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "ru";

const DICT = {
  en: {
    appName: "Parq",
    operator: "Operator",
    driver: "Driver",
    admin: "Admin",
    nav: {
      dashboard: "Dashboard",
      map: "Live Map",
      reservations: "Reservations",
      vehicles: "Vehicles",
      transactions: "Transactions",
      spots: "Spots Admin",
      evCharging: "EV Charging",
      analytics: "Analytics",
      pricing: "Pricing",
      settings: "Settings",
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
      evTitle: "EV Charging",
      evSubtitle: "Live charger telemetry, energy delivered and queue.",
      analyticsTitle: "Analytics",
      analyticsSubtitle: "Occupancy, demand, and operational performance.",
      pricingTitle: "Plans & Pricing",
      pricingSubtitle: "Choose the tier that fits your operation.",
      settingsTitle: "Settings",
      settingsSubtitle: "Account, preferences and operator profile.",
    },
    metrics: {
      revenueToday: "Revenue Today",
      utilization: "Spot Utilization",
      activeReservations: "Active Reservations",
      registeredVehicles: "Registered Vehicles",
      revenueTrend: "Revenue Trend (Last 7 Days)",
      recentActivity: "Recent Activity",
      zoneUtilization: "Zone Utilization",
      alerts: "Alerts & Insights",
      peakHour: "Peak Hour",
      avgDuration: "Avg. Duration",
      energyDelivered: "Energy Delivered",
      activeChargers: "Active Chargers",
      sessionsToday: "Sessions Today",
      avgSession: "Avg. Session",
    },
    hero: {
      eyebrow: "Smart Mobility Platform",
      title: "Premium parking for the connected city.",
      subtitle: "Reservations, EV charging, live occupancy and revenue analytics — unified in one elegant operations console.",
      ctaPrimary: "Start free trial",
      ctaSecondary: "Sign in",
      stat1: "Cities",
      stat2: "Spots online",
      stat3: "Sessions / day",
      stat4: "Uptime",
      partners: "Trusted by mobility operators worldwide",
      footerCta: "Ready to upgrade your parking operation?",
      footerCtaSub: "Deploy in days, scale to thousands of bays.",
      featuresTitle: "Everything you need to run modern parking",
      f1Title: "Live occupancy map",
      f1Body: "Yandex-powered real-time view of every bay and zone.",
      f2Title: "EV charging built-in",
      f2Body: "Telemetry, queueing and per-session energy reports.",
      f3Title: "Revenue analytics",
      f3Body: "Trends, peak hours and zone-by-zone benchmarks.",
      f4Title: "Operator controls",
      f4Body: "Roles, status overrides, alerts and audit trail.",
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
      signOut: "Sign out",
      mostPopular: "Most popular",
      perMonth: "/ month",
      getStarted: "Get started",
      contactSales: "Contact sales",
    },
    ev: {
      bayLabel: "Bay",
      kw: "kW",
      kwh: "kWh",
      charging: "Charging",
      idle: "Idle",
      queued: "Queued",
      stationsTitle: "Charging Stations",
      sessionsTitle: "Recent Sessions",
      today: "Today",
      sessionsHint: "+12% vs yesterday",
      ready: "Ready",
      nextUp: "Next up",
      active: "active",
      completed: "completed",
    },
    analytics: {
      hourlyOccupancy: "Hourly Occupancy",
      durationByType: "Avg. Duration by Vehicle Type",
      zoneRevenue: "Revenue by Zone",
      peakInsights: "Peak Hour Insights",
      filtersTitle: "Filters",
      range24h: "Last 24 hours",
      range7d: "Last 7 days",
      range30d: "Last 30 days",
      range90d: "Last 90 days",
      allTypes: "All vehicle types",
      conversion: "Conversion",
      conversionHint: "view → reservation",
      peakHourHint: "96% occupancy",
      avgDurationHint: "across all types",
      morningPeak: "Morning peak",
      lunchSurge: "Lunch surge",
      eveningPeak: "Evening peak",
      lateNightLow: "Late night low",
    },
    pricing: {
      monthly: "Monthly",
      annual: "Annual",
      custom: "Custom",
      starterTagline: "For small lots up to 50 bays.",
      proTagline: "For multi-zone operators.",
      enterpriseTagline: "City-scale deployments.",
      simulatedToast: "simulated checkout — connect Stripe to enable real payments.",
    },
    slotGrid: {
      title: "Slot grid",
      spots: "spots",
      zone: "Zone",
    },
    alerts: {
      maintenanceOverdue: "Maintenance overdue",
      maintenanceBody: "3 spots flagged for inspection over 24h.",
      evSurge: "EV demand surge",
      evSurgeBody: "More EV bookings vs last week — scale chargers.",
      peakBody: "Expected occupancy 96%. Consider dynamic pricing.",
      durationBody: "Up 6% week-over-week.",
    },
    settings: {
      account: "Account",
      preferences: "Preferences",
      notifications: "Notifications",
      operatorProfile: "Operator Profile",
      emailAlerts: "Email alerts",
      pushAlerts: "Push notifications",
      smsAlerts: "SMS alerts",
      organizationName: "Organization name",
      timezone: "Timezone",
      currency: "Currency",
      save: "Save changes",
    },
  },
  ru: {
    appName: "Парк",
    operator: "Оператор",
    driver: "Водитель",
    admin: "Администратор",
    nav: {
      dashboard: "Панель",
      map: "Карта",
      reservations: "Бронирования",
      vehicles: "Автомобили",
      transactions: "Платежи",
      spots: "Парковочные места",
      evCharging: "Зарядка EV",
      analytics: "Аналитика",
      pricing: "Тарифы",
      settings: "Настройки",
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
      evTitle: "Зарядка электромобилей",
      evSubtitle: "Телеметрия зарядных станций, переданная энергия и очередь.",
      analyticsTitle: "Аналитика",
      analyticsSubtitle: "Загруженность, спрос и операционные показатели.",
      pricingTitle: "Тарифы и планы",
      pricingSubtitle: "Выберите тариф под ваш бизнес.",
      settingsTitle: "Настройки",
      settingsSubtitle: "Аккаунт, предпочтения и профиль оператора.",
    },
    metrics: {
      revenueToday: "Выручка за сегодня",
      utilization: "Загруженность",
      activeReservations: "Активные брони",
      registeredVehicles: "Автомобили в системе",
      revenueTrend: "Динамика выручки (7 дней)",
      recentActivity: "Последние события",
      zoneUtilization: "Загруженность по зонам",
      alerts: "Оповещения и инсайты",
      peakHour: "Пиковый час",
      avgDuration: "Ср. длительность",
      energyDelivered: "Энергия отдана",
      activeChargers: "Активные зарядки",
      sessionsToday: "Сессий сегодня",
      avgSession: "Ср. сессия",
    },
    hero: {
      eyebrow: "Платформа умной мобильности",
      title: "Премиум-парковка для связного города.",
      subtitle: "Бронирования, зарядка EV, загруженность и аналитика выручки — в одной элегантной консоли оператора.",
      ctaPrimary: "Начать бесплатно",
      ctaSecondary: "Войти",
      stat1: "Городов",
      stat2: "Мест онлайн",
      stat3: "Сессий / день",
      stat4: "Аптайм",
      partners: "Нам доверяют операторы по всему миру",
      footerCta: "Готовы вывести парковку на новый уровень?",
      footerCtaSub: "Развёртывание за дни, масштаб до тысяч мест.",
      featuresTitle: "Всё для современной парковки",
      f1Title: "Карта в реальном времени",
      f1Body: "Каждое место и зона на базе Яндекс.Карт.",
      f2Title: "Зарядка EV из коробки",
      f2Body: "Телеметрия, очередь и отчёты по энергии.",
      f3Title: "Аналитика выручки",
      f3Body: "Тренды, пиковые часы и сравнение зон.",
      f4Title: "Контроль оператора",
      f4Body: "Роли, статусы, оповещения и журнал.",
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
      signOut: "Выйти",
      mostPopular: "Популярный",
      perMonth: "/ мес",
      getStarted: "Начать",
      contactSales: "Связаться",
    },
    ev: {
      bayLabel: "Стойка",
      kw: "кВт",
      kwh: "кВт·ч",
      charging: "Заряжается",
      idle: "Свободна",
      queued: "Очередь",
      stationsTitle: "Зарядные станции",
      sessionsTitle: "Недавние сессии",
      today: "Сегодня",
      sessionsHint: "+12% к вчера",
      ready: "Готова",
      nextUp: "Следующий",
      active: "активна",
      completed: "завершена",
    },
    analytics: {
      hourlyOccupancy: "Загруженность по часам",
      durationByType: "Ср. длительность по типу",
      zoneRevenue: "Выручка по зонам",
      peakInsights: "Инсайты пиковых часов",
      filtersTitle: "Фильтры",
      range24h: "Последние 24 часа",
      range7d: "Последние 7 дней",
      range30d: "Последние 30 дней",
      range90d: "Последние 90 дней",
      allTypes: "Все типы авто",
      conversion: "Конверсия",
      conversionHint: "просмотр → бронь",
      peakHourHint: "96% загрузки",
      avgDurationHint: "по всем типам",
      morningPeak: "Утренний пик",
      lunchSurge: "Обеденный всплеск",
      eveningPeak: "Вечерний пик",
      lateNightLow: "Ночной спад",
    },
    pricing: {
      monthly: "Помесячно",
      annual: "Годовой",
      custom: "Индивидуально",
      starterTagline: "Для небольших парковок до 50 мест.",
      proTagline: "Для мульти-зональных операторов.",
      enterpriseTagline: "Городской масштаб.",
      simulatedToast: "симуляция оплаты — подключите Stripe для реальных платежей.",
    },
    slotGrid: {
      title: "Сетка мест",
      spots: "мест",
      zone: "Зона",
    },
    alerts: {
      maintenanceOverdue: "Просрочено ТО",
      maintenanceBody: "3 места ожидают осмотра более 24ч.",
      evSurge: "Рост спроса на EV",
      evSurgeBody: "Больше броней EV vs прошлая неделя — расширьте зарядки.",
      peakBody: "Ожидается загрузка 96%. Рассмотрите динамические тарифы.",
      durationBody: "+6% к прошлой неделе.",
    },
    settings: {
      account: "Аккаунт",
      preferences: "Предпочтения",
      notifications: "Уведомления",
      operatorProfile: "Профиль оператора",
      emailAlerts: "Email-уведомления",
      pushAlerts: "Push-уведомления",
      smsAlerts: "SMS-уведомления",
      organizationName: "Название организации",
      timezone: "Часовой пояс",
      currency: "Валюта",
      save: "Сохранить",
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
