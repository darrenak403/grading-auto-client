import { redirect } from "next/navigation";
import { isAuthBypassEnabled } from "@/lib/auth/skip-auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { cookies } from "next/headers";

export default async function Home() {
  if (isAuthBypassEnabled()) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  redirect(token ? "/dashboard" : "/login");
}
