// src/app/[locale]/today/insert/route.ts
import { getSupabaseClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ locale: "fr" | "en" }> }
) {
  const { locale } = await params;
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("plans").insert({
    locale,
    title: locale === "fr" ? "Ajout test" : "Test insert",
    note: locale === "fr" ? "Créé depuis la route /today/insert" : "Created from /today/insert",
  });

  if (error) {
    console.error("Insert error:", error);
  }

  // Retour à /[locale]/today
  return NextResponse.redirect(new URL(`/${locale}/today`, req.url), 302);
}
