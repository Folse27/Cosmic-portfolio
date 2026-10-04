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
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
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
  meta: { portfolio: "Portfolio" },
};

export type Dict = typeof en;

const de: Dict = {
  nav: { about: "Über mich", projects: "Projekte", contact: "Kontakt", language: "Sprache" },
  hero: { viewProjects: "Projekte ansehen", contactMe: "Kontakt aufnehmen", scrollToAbout: "Zum Abschnitt „Über mich“ scrollen" },
  about: { kicker: "Über mich", title: "Hinter der Konsole", skills: "Tech-Stack & Skills" },
  projects: { kicker: "Ausgewählte Arbeiten", title: "Projekte", more: "Weitere Projekte", empty: "Noch keine Projekte." },
  card: { seeHow: "So funktioniert’s" },
  project: {
    allProjects: "← Alle Projekte",
    whatItIs: "Worum es geht",
    problem: "Das Problem",
    howItHelps: "Wie es hilft",
    results: "Die Ergebnisse",
    goodToKnow: "Gut zu wissen",
    gallery: "Galerie",
    links: "Links",
    image: "Bild",
    back: "← Zurück zu den Projekten",
    discuss: "Ähnliches Projekt besprechen",
    notFound: "Projekt nicht gefunden",
  },
  contact: {
    kicker: "Kontakt",
    title: "Kanal öffnen",
    intro: "Sie haben eine Automatisierungsaufgabe, eine Website, die entstehen soll, oder eine Idee, die es wert ist? Schreiben Sie mir – ich lese jede Nachricht.",
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
  meta: { portfolio: "Portfolio" },
};

const ru: Dict = {
  nav: { about: "Обо мне", projects: "Проекты", contact: "Контакты", language: "Язык" },
  hero: { viewProjects: "Смотреть проекты", contactMe: "Связаться", scrollToAbout: "Перейти к разделу «Обо мне»" },
  about: { kicker: "Обо мне", title: "За консолью", skills: "Стек и навыки" },
  projects: { kicker: "Избранные работы", title: "Проекты", more: "Другие проекты", empty: "Проектов пока нет." },
  card: { seeHow: "Как это работает" },
  project: {
    allProjects: "← Все проекты",
    whatItIs: "Что это",
    problem: "Проблема",
    howItHelps: "Как это помогает",
    results: "Результаты",
    goodToKnow: "Важно знать",
    gallery: "Галерея",
    links: "Ссылки",
    image: "изображение",
    back: "← Назад к проектам",
    discuss: "Обсудить похожий проект",
    notFound: "Проект не найден",
  },
  contact: {
    kicker: "Контакты",
    title: "Открыть канал",
    intro: "Есть задача по автоматизации, сайт, который нужно сделать, или идея, которую стоит обсудить? Напишите мне — я читаю каждое сообщение.",
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
  meta: { portfolio: "Портфолио" },
};

const DICTS: Record<Locale, Dict> = { de, en, ru };

export const getDict = (lang: Locale): Dict => DICTS[lang];
