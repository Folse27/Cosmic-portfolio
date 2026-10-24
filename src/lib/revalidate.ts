import { revalidatePath } from "next/cache";

/**
 * Public pages are cached (see app/(site)/[lang]/layout.tsx). Call this after
 * every successful admin write so the change is visible on the next request.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
