export const ADMIN_EMAILS = [
  "napaychristianpaolo@gmail.com",
  "staff1@gmail.com",
  "staff2@gmail.com",
] as const;

export const ADMIN_CODE = "panel";

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number]);
}
