/**
 * Public-site languages. German is the default and lives at the unprefixed
 * URLs ("/", "/projects/x"); the others are prefixed ("/en/...", "/ru/...").
 * The middleware rewrites unprefixed paths to the German route internally.
 */
export const LOCALES = ["de", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

/** Languages whose CMS text is stored as translations; English is the base columns. */
export const TRANSLATED_LOCALES = ["de", "ru"] as const;
export type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

export const OG_LOCALE: Record<Locale, string> = { de: "de_DE", en: "en_US", ru: "ru_RU" };

/** "/projects/x" → "/en/projects/x"; "/#contact" → "/en#contact"; German stays unprefixed. */
export function localePath(lang: Locale, path: string): string {
  if (lang === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${lang}`;
  if (path.startsWith("/#")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

/** "/en/projects/x" → { lang: "en", path: "/projects/x" }; unprefixed paths are German. */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const first = pathname.split("/")[1];
  // "/de/..." is the internal path of cached German pages (the middleware
  // rewrites "/x" to "/de/x"), so the default locale is stripped as well.
  if (isLocale(first)) {
    return { lang: first, path: pathname.slice(first.length + 1) || "/" };
  }
  return { lang: DEFAULT_LOCALE, path: pathname };
}

/** Canonical + hreflang alternates for one page, for Next's `alternates` metadata. */
export function localeAlternates(lang: Locale, path: string) {
  const languages: Record<string, string> = { "x-default": localePath(DEFAULT_LOCALE, path) };
  for (const l of LOCALES) languages[l] = localePath(l, path);
  return { canonical: localePath(lang, path), languages };
}

/* ── UI strings ───────────────────────────────────────────────────────── */

const en = {
  nav: { about: "About", projects: "Projects", contact: "Contact", language: "Language" },
  hero: { viewProjects: "View projects", contactMe: "Contact me", scrollToAbout: "Scroll to about section" },
  about: { kicker: "About", title: "Behind the console", skills: "Tech stack & skills" },
  projects: { kicker: "Selected work", title: "Projects", more: "More projects", empty: "No projects yet." },
  card: { seeHow: "See how it works" },
  price: {
    label: "Price",
    from: "from {price}",
    fixed: "{price}",
    hourly: "{price} per hour",
    note: "Guide price. I'll give you an exact quote after a short chat about your task. Running costs, such as AI services or hosting, come on top where they apply.",
  },
  project: {
    allProjects: "← All projects",
    whatItIs: "What it is",
    problem: "The problem",
    howItHelps: "How it helps",
    results: "The results",
    goodToKnow: "Good to know",
    gallery: "Gallery",
    links: "Links",
    image: "image",
    back: "← Back to projects",
    discuss: "Discuss a similar project",
    notFound: "Project not found",
  },
  dataProtection: {
    kicker: "Data protection",
    title: "What happens to your customers' data",
    points: [
      {
        title: "Stored only as long as needed",
        text: "Where a bot needs to remember something, such as reply drafts or a conversation excerpt, it deletes it automatically after 7 to 30 days, and I delete a customer's data sooner on request. Backups are kept for up to 28 days. Chats and orders stay in the CRM your business already uses.",
      },
      {
        title: "AI replies via Claude or OpenAI",
        text: "To write a draft, the bot sends the conversation excerpt and any photos the customer sent to the Anthropic (Claude) or OpenAI API. By default, neither provider trains its models on API data.",
      },
      {
        title: "Servers in Frankfurt",
        text: "My bots, admin panels, databases and backups run on Render, Vercel and Supabase in Frankfurt (EU). Drafts reach your team in a private Telegram group that deletes messages after 30 days.",
      },
      {
        title: "Access only with 2FA",
        text: "Only admins can open the control panel and backups, with a password and a two-factor code. Risky actions such as backups or switching on the autopilot ask for the code again.",
      },
      {
        title: "A contract for EU businesses",
        text: "For businesses in the EU, I sign a data processing agreement under Art. 28 GDPR on request, with a list of every service that handles the data, and help with the note for your privacy policy.",
      },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Open a channel",
    intro: "Have an automation problem, a website to build, or an idea worth exploring? Send a message — I read everything.",
    emailMe: "Email me",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    message: "Message",
    messagePlaceholder: "Tell me about your project…",
    send: "Send message",
    sending: "Sending…",
    privacyNote: "Your name, email and message are stored only so I can reply to you. They are never shared or used for advertising. See the",
    privacyLink: "Privacy Policy",
    sent: "Message sent — I'll get back to you soon.",
    error: "Something went wrong. Try again or use email.",
  },
  footer: { legal: "Legal Notice", privacy: "Privacy Policy" },
  /** The legal texts exist in English only; other languages say so instead of looking half-translated. */
  legal: { privacyKicker: "GDPR", impressumKicker: "Impressum", englishOnly: "" },
  meta: { portfolio: "Portfolio" },
};

export type Dict = typeof en;

const de: Dict = {
  nav: { about: "Über mich", projects: "Projekte", contact: "Kontakt", language: "Sprache" },
  hero: { viewProjects: "Projekte ansehen", contactMe: "Kontakt aufnehmen", scrollToAbout: "Zum Abschnitt „Über mich“ scrollen" },
  about: { kicker: "Über mich", title: "Der Mensch hinter den Projekten", skills: "Technologien & Fähigkeiten" },
  projects: { kicker: "Ausgewählte Arbeiten", title: "Projekte", more: "Weitere Projekte", empty: "Noch keine Projekte." },
  card: { seeHow: "So funktioniert’s" },
  price: {
    label: "Preis",
    from: "ab {price}",
    fixed: "{price}",
    hourly: "{price} pro Stunde",
    note: "Richtpreis. Den genauen Preis nenne ich nach einem kurzen Gespräch über Ihre Aufgabe. Laufende Kosten, etwa für KI-Dienste oder Hosting, kommen gegebenenfalls hinzu.",
  },
  project: {
    allProjects: "← Alle Projekte",
    whatItIs: "Worum es geht",
    problem: "Das Problem",
    howItHelps: "Wie es hilft",
    results: "Was es bringt",
    goodToKnow: "Gut zu wissen",
    gallery: "Galerie",
    links: "Links",
    image: "Bild",
    back: "← Zurück zu den Projekten",
    discuss: "Kontakt aufnehmen",
    notFound: "Projekt nicht gefunden",
  },
  dataProtection: {
    kicker: "Datenschutz",
    title: "Was mit den Daten Ihrer Kunden passiert",
    points: [
      {
        title: "Gespeichert wird nur so lange wie nötig",
        text: "Muss sich ein Bot etwas merken, etwa Antwortentwürfe oder einen Gesprächsausschnitt, löscht er es nach 7 bis 30 Tagen automatisch. Auf Wunsch lösche ich die Daten einzelner Kunden auch früher. Sicherungskopien werden bis zu 28 Tage aufbewahrt. Chats und Bestellungen bleiben im CRM, das Ihr Unternehmen bereits nutzt.",
      },
      {
        title: "KI-Antworten über Claude oder OpenAI",
        text: "Für einen Antwortentwurf schickt der Bot den Gesprächsausschnitt und eventuelle Kundenfotos an die API von Anthropic (Claude) oder OpenAI. Beide Anbieter nutzen API-Daten standardmäßig nicht zum Training ihrer Modelle.",
      },
      {
        title: "Server in Frankfurt",
        text: "Bots, Admin-Panels, Datenbanken und Sicherungskopien laufen bei Render, Vercel und Supabase in Frankfurt (EU). Entwürfe erreichen Ihr Team in einer privaten Telegram-Gruppe, die Nachrichten nach 30 Tagen löscht.",
      },
      {
        title: "Zugriff nur mit 2FA",
        text: "Admin-Panel und Sicherungskopien öffnen nur Administratoren, mit Passwort und Zwei-Faktor-Code. Für heikle Aktionen wie Backups oder das Einschalten des Autopiloten wird der Code erneut abgefragt.",
      },
      {
        title: "AV-Vertrag nach DSGVO",
        text: "Auf Wunsch schließe ich mit Ihnen einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO, mit einer Liste aller Dienste, die Daten verarbeiten, und helfe beim Hinweis für Ihre Datenschutzerklärung.",
      },
    ],
  },
  contact: {
    kicker: "Kontakt",
    title: "Schreiben Sie mir",
    intro: "Sie bilden Fachinformatiker für Anwendungsentwicklung aus? Dann freue ich mich über eine Einladung zum Gespräch. Sie möchten in Ihrem Unternehmen eine Aufgabe automatisieren? Schreiben Sie mir, worum es geht. Ich antworte auf jede Nachricht.",
    emailMe: "E-Mail schreiben",
    name: "Name",
    namePlaceholder: "Ihr Name",
    email: "E-Mail",
    emailPlaceholder: "sie@beispiel.de",
    message: "Nachricht",
    messagePlaceholder: "Worum geht es?",
    send: "Nachricht senden",
    sending: "Wird gesendet…",
    privacyNote: "Ihr Name, Ihre E-Mail-Adresse und Ihre Nachricht werden nur gespeichert, damit ich Ihnen antworten kann. Sie werden nie weitergegeben oder für Werbung genutzt. Mehr dazu in der",
    privacyLink: "Datenschutzerklärung",
    sent: "Nachricht gesendet – ich melde mich bald.",
    error: "Etwas ist schiefgelaufen. Bitte erneut versuchen oder per E-Mail schreiben.",
  },
  footer: { legal: "Impressum", privacy: "Datenschutz" },
  legal: {
    privacyKicker: "Datenschutzerklärung",
    impressumKicker: "Impressum",
    englishOnly: "Diese Seite ist derzeit nur auf Englisch verfügbar.",
  },
  meta: { portfolio: "Portfolio" },
};

const ru: Dict = {
  nav: { about: "Обо мне", projects: "Проекты", contact: "Контакты", language: "Язык" },
  hero: { viewProjects: "Смотреть проекты", contactMe: "Связаться", scrollToAbout: "Перейти к разделу «Обо мне»" },
  about: { kicker: "Обо мне", title: "Кто стоит за проектами", skills: "Что я делаю" },
  projects: { kicker: "Избранные работы", title: "Проекты", more: "Другие проекты", empty: "Проектов пока нет." },
  card: { seeHow: "Как это работает" },
  price: {
    label: "Стоимость",
    from: "от {price}",
    fixed: "{price}",
    hourly: "{price} в час",
    note: "Ориентировочная цена. Точную стоимость назову после короткого разговора о вашей задаче. Ежемесячные расходы, например на ИИ-сервисы или хостинг, оплачиваются отдельно, если они есть.",
  },
  project: {
    allProjects: "← Все проекты",
    whatItIs: "Что это",
    problem: "Проблема",
    howItHelps: "Как это помогает",
    results: "Что это даёт",
    goodToKnow: "Важно знать",
    gallery: "Галерея",
    links: "Ссылки",
    image: "изображение",
    back: "← Назад к проектам",
    discuss: "Обсудить похожий проект",
    notFound: "Проект не найден",
  },
  dataProtection: {
    kicker: "Данные",
    title: "Что происходит с данными ваших клиентов",
    points: [
      {
        title: "Храню ровно столько, сколько нужно",
        text: "Если боту нужно что-то запомнить, например черновики ответов или отрывок переписки, он автоматически удаляет это через 7–30 дней, а по запросу я удаляю данные клиента раньше. Резервные копии хранятся до 28 дней. Чаты и заказы остаются в CRM, которой пользуется ваша компания.",
      },
      {
        title: "Ответы ИИ через Claude или OpenAI",
        text: "Чтобы написать черновик, бот отправляет отрывок переписки и фото клиента, если они есть, в API Anthropic (Claude) или OpenAI. По умолчанию оба сервиса не обучают свои модели на данных из API.",
      },
      {
        title: "Серверы во Франкфурте",
        text: "Боты, админ-панели, базы данных и резервные копии работают на Render, Vercel и Supabase во Франкфурте (ЕС). Черновики приходят вашей команде в закрытую Telegram-группу, где сообщения удаляются через 30 дней.",
      },
      {
        title: "Доступ только с 2FA",
        text: "Админ-панель и резервные копии открывают только администраторы: нужен пароль и код двухфакторной аутентификации. Для рискованных действий, например резервных копий или включения автопилота, код запрашивается повторно.",
      },
      {
        title: "Договор для компаний из ЕС",
        text: "Для компаний из ЕС по запросу заключаю договор об обработке данных по ст. 28 GDPR со списком всех сервисов, которые обрабатывают данные, и помогаю с текстом для вашей политики конфиденциальности.",
      },
    ],
  },
  contact: {
    kicker: "Контакты",
    title: "Напишите мне",
    intro: "Есть задача, которую пора автоматизировать, нужен сайт или хочется обсудить идею? Я читаю каждое сообщение и отвечаю.",
    emailMe: "Написать на e-mail",
    name: "Имя",
    namePlaceholder: "Ваше имя",
    email: "E-mail",
    emailPlaceholder: "you@example.com",
    message: "Сообщение",
    messagePlaceholder: "Расскажите о вашем проекте…",
    send: "Отправить",
    sending: "Отправка…",
    privacyNote: "Ваше имя, e-mail и сообщение хранятся только для того, чтобы я мог ответить. Они никому не передаются и не используются для рекламы. Подробнее — в",
    privacyLink: "Политике конфиденциальности",
    sent: "Сообщение отправлено — скоро отвечу.",
    error: "Что-то пошло не так. Попробуйте ещё раз или напишите на e-mail.",
  },
  footer: { legal: "Правовая информация", privacy: "Конфиденциальность" },
  legal: {
    privacyKicker: "Конфиденциальность",
    impressumKicker: "Impressum",
    englishOnly: "Эта страница пока доступна только на английском языке.",
  },
  meta: { portfolio: "Портфолио" },
};

const DICTS: Record<Locale, Dict> = { de, en, ru };

export const getDict = (lang: Locale): Dict => DICTS[lang];

/** 800, "from", "de" → "ab 800 €"; 25, "hourly", "en" → "€25 per hour". Null without an amount. */
export function formatPrice(lang: Locale, amount: number | null, type: "from" | "fixed" | "hourly" | null): string | null {
  if (amount === null) return null;
  const money = new Intl.NumberFormat(lang, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
  return DICTS[lang].price[type ?? "from"].replace("{price}", money);
}
