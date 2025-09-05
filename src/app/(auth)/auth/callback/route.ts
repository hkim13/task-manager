import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (user && !error) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // If user doesn't exist in our users table, create them
      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          token_identifier: user.id,
          created_at: new Date().toISOString(),
        });

        // If there's an error inserting, it might be a duplicate key error
        // which is fine - the user already exists
      }

      // Check if user has an active subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      // If no active subscription, redirect to pricing
      if (!subscription) {
        return NextResponse.redirect(new URL("/pricing", requestUrl.origin));
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
