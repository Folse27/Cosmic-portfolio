/**
 * Seeds the database with:
 *  - the admin user (ADMIN_EMAIL / ADMIN_PASSWORD from the environment)
 *  - placeholder site settings (edit them later in /admin → Settings)
 *  - the six initial projects
 *
 * Safe to re-run: the admin password and settings are updated in place,
 * projects that already exist (matched by slug) are left untouched so
 * your CMS edits are never overwritten.
 *
 * Usage: npm run db:seed   (after npm run db:push or db:migrate)
 */
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { adminUsers, projects, siteSettings, type NewProject } from "../src/db/schema";

const SEED_PROJECTS: Array<Omit<NewProject, "sortOrder">> = [
  {
    slug: "automated-whatsapp-crm-pipeline",
    title: "Automated WhatsApp CRM Pipeline",
    dateLabel: "01.06.2026",
    summary:
      "A 24/7 WhatsApp responder that qualifies leads with AI and writes every detail straight into Google Sheets.",
    description:
      "An automated WhatsApp responder for businesses that converses with clients and, based on the outcome, writes and updates values in a Google Sheet — capturing key fields such as the client's name, phone number, lead source, current status, and other details important to the business.",
    problems: [
      "Managers couldn't respond to clients in time.",
      "Too much time was spent collecting basic details needed to move a conversation forward.",
      "Managers were inexperienced in sales.",
      "Clients tended to forget about their conversations, so managers had to follow up every 24–120 hours to keep leads warm.",
    ],
    solution:
      "The automation replies to every client within minutes, at any time of day. It runs a quick survey to capture the crucial details, which are instantly written to a Google Sheet. Follow-up reminders are sent automatically after 24 and 120 hours of inactivity. An AI was implemented to guide clients through the conversation instead of the managers.",
    outcomes: [
      "Faster responses mean fewer lost potential clients.",
      "Booking success increased, as the AI outperforms the managers.",
      "Google Sheets updates happen instantly.",
    ],
    tags: ["WhatsApp", "AI Agent", "Google Sheets", "CRM", "Automation"],
  },
  {
    slug: "automated-web-scraping-crm-pipeline",
    title: "Automated Web Scraping CRM Pipeline",
    dateLabel: "04.02.2026",
    summary:
      "One command fills entire batches of empty perfume product cards by scraping the web — with Telegram error alerts and retry controls.",
    description:
      "A tool that processes large batches of empty perfume product cards in a CRM and fills in every field by scraping the internet for the required data. It includes developer commands to retry with specific parameters for better results when needed.",
    problems: [
      "Manually searching the web for specific perfume data and photos took far too long.",
      "Managers were expensive.",
    ],
    solution:
      "With a single command, the tool processes one or many perfume cards in the CRM within minutes, dramatically reducing both the time to publish new products and manager costs. When an error occurs, the owner is notified via a Telegram bot with full error details and can retry with adjusted parameters.",
    outcomes: [
      "Time spent is drastically reduced (~5× faster workflow, 90–100% automation rate).",
      "Costs cut to an absolute minimum.",
      "New products are published much faster.",
      "Error notifications with retry controls via Telegram.",
    ],
    coverImage: "/images/covers/web-scraping-crm.jpg",
    tags: ["Web Scraping", "CRM", "Python", "Telegram", "Automation"],
  },
  {
    slug: "automated-private-messages",
    title: "Automated Private Messages for Telegram / WhatsApp / Instagram",
    summary:
      "Human-like auto-responders for WhatsApp, Telegram and Instagram that keep answering clients when you can't.",
    description:
      "An auto-responder that can converse like a real human with clients or other important contacts, around the clock. I built realistic auto-responders for WhatsApp, Telegram, and Instagram, as well as openly bot-like ones for Telegram and WhatsApp.",
    problems: ["Client overflow — too many private messages.", "Not enough time to process them all."],
    solution:
      "Many businesses and busy individuals lose potential clients simply because they can't reply to everyone. This automation responds at all times, with either human-like or clearly automated conversational behavior, depending on what's needed. For realistic behavior, the bot is trained on a certain amount of data about the person or company.",
    outcomes: [],
    note:
      "Like any AI, it can occasionally malfunction — but in the worst case, it simply doesn't send a message.",
    tags: ["Telegram", "WhatsApp", "Instagram", "AI Chatbot", "Automation"],
  },
  {
    slug: "youtube-video-audio-summary",
    title: "YouTube Video → Audio Summary",
    dateLabel: "11.11.2025",
    summary: "Drop in a YouTube link, get a ~3-minute spoken summary back as a voice message.",
    description:
      "A tool that takes any YouTube link or a .txt file, generates a ~3-minute summary, and sends it back to the user as a voice message.",
    problems: [],
    solution:
      "Some videos are overloaded with information or simply too long to watch. This tool saves time while still covering everything in the video.",
    outcomes: ["Minimal to zero running costs — only slight costs when scaling."],
    coverImage: "/images/covers/youtube-summary.jpg",
    tags: ["YouTube", "Summarization", "Text-to-Speech", "AI"],
  },
  {
    slug: "audio-to-text-telegram-transcription",
    title: "Audio → Text Telegram Transcription",
    dateLabel: "12.02.2025",
    summary: "A Telegram bot that instantly turns any voice message into clean text.",
    description:
      "A Telegram bot that automatically transcribes any voice message and sends the result back to the sender or the group chat. Highly configurable.",
    problems: [],
    solution:
      "My friends never wanted to listen to my long voice messages, so I built a tool that converts them to text — now they have no excuse not to \"listen.\" 😄",
    outcomes: ["Zero running costs."],
    coverImage: "/images/covers/audio-to-text.png",
    tags: ["Telegram Bot", "Speech-to-Text", "Transcription"],
  },
  {
    slug: "website-with-crm-integration-cms",
    title: "Website with CRM Integration & Built-in CMS",
    summary: "A from-scratch website with live CRM product sync, daily refresh and its own admin panel.",
    description:
      "A complete website designed entirely from scratch, integrated with a CRM. It pulls product information from the CRM to build a fully searchable product catalog, automatically refreshes the data every day, and includes a built-in CMS/admin panel for managing the site.",
    problems: [],
    solution: "",
    outcomes: [
      "Custom design built from the ground up.",
      "Live CRM integration feeding a searchable catalog.",
      "Automatic daily data synchronization.",
      "Built-in CMS/admin panel.",
    ],
    tags: ["Web Development", "CRM Integration", "CMS", "Full-Stack"],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (create .env from .env.example).");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const db = drizzle(pool);

  /* Admin user — password is hashed, never stored in plain text. */
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn("⚠ ADMIN_PASSWORD not set — using the insecure default. Set it in .env and re-seed.");
  }
  const passwordHash = bcrypt.hashSync(password, 12);
  await db
    .insert(adminUsers)
    .values({ email, passwordHash })
    .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } });
  console.log(`✔ Admin user ready: ${email}`);

  /* Site settings — placeholders, replace them in /admin → Settings. */
  const settings = {
    name: "[YOUR NAME]",
    title: "[YOUR TITLE / TAGLINE]",
    tagline:
      "Placeholder tagline — a short line about the automations and websites you build. Edit this in the admin panel.",
    bio:
      "Placeholder bio, paragraph one. Introduce yourself here: who you are, what you build, and the kind of problems you enjoy solving. Replace this text in the admin panel under Settings.\n\nPlaceholder bio, paragraph two. Mention your background, the industries you have worked with, and what working with you looks like. This is placeholder copy — swap it for your real story.",
    profileImage: null as string | null,
    email: "you@example.com",
    metaDescription:
      "Portfolio of [YOUR NAME] — automation and web development projects: WhatsApp/Telegram bots, CRM pipelines, web scraping, and custom websites.",
    skills: [
      "Python",
      "JavaScript / TypeScript",
      "Next.js",
      "Node.js",
      "Telegram Bot API",
      "WhatsApp Automation",
      "Web Scraping",
      "Google Sheets API",
      "AI / LLM Integration",
      "CRM Integrations",
    ],
    socials: [
      { label: "Telegram", url: "https://t.me/your_username" },
      { label: "WhatsApp", url: "https://wa.me/00000000000" },
      { label: "GitHub", url: "https://github.com/your_username" },
    ],
    updatedAt: new Date(),
  };
  await db
    .insert(siteSettings)
    .values({ id: "singleton", ...settings })
    .onConflictDoUpdate({ target: siteSettings.id, set: settings });
  console.log("✔ Site settings seeded (placeholders — edit in /admin)");

  /* Projects — inserted once; existing slugs are never overwritten. */
  for (const [index, project] of SEED_PROJECTS.entries()) {
    await db
      .insert(projects)
      .values({ ...project, sortOrder: index })
      .onConflictDoNothing({ target: projects.slug });
  }
  console.log(`✔ ${SEED_PROJECTS.length} projects seeded`);

  await pool.end();
  console.log("\nDone. Sign in at /admin/login with your ADMIN_EMAIL and ADMIN_PASSWORD.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
