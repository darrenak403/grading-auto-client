/** Dev-only auth bypass — never active in production builds. */
export function isAuthBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return (
    process.env.SKIP_AUTH === "true" ||
    process.env.NEXT_PUBLIC_SKIP_AUTH === "true"
  );
}
