// src/app/[locale]/today/page.tsx
import { getSupabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

type Plan = {
  id: string;
  created_at: string;
  locale: "fr" | "en";
  title: string;
  note: string | null;
};

// Page serveur (RSC)
export default async function TodayPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;

  const supabase = getSupabaseClient();

  // Lire les 5 derniers éléments pour cette locale
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("locale", locale)
    .order("created_at", { ascending: false })
    .limit(5);

  const plans = (data ?? []) as Plan[];

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-3xl font-semibold">
        {locale === "fr" ? "Programme du jour" : "Today’s plan"}
      </h1>

      <div className="p-4 rounded-xl bg-sky-100">
        Supabase : {error ? "❌ erreur" : "✅ OK"}
      </div>

      {/* Liste */}
      <ul className="space-y-2">
        {plans.map((p) => (
          <li key={p.id} className="rounded-lg border p-3">
            <div className="text-lg font-medium">{p.title}</div>
            {p.note && <div className="opacity-70">{p.note}</div>}
            <div className="text-xs opacity-60">{new Date(p.created_at).toLocaleString()}</div>
          </li>
        ))}
        {plans.length === 0 && (
          <li className="opacity-70">
            {locale === "fr" ? "Aucune donnée pour le moment." : "No data yet."}
          </li>
        )}
      </ul>

      {/* Bouton d’insertion simple (via route /api insert) */}
      <form action={`/${locale}/today/insert`} method="post">
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          type="submit"
        >
          {locale === "fr" ? "Insérer une ligne de test" : "Insert a test row"}
        </button>
      </form>

      <div>
        <Link href={`/${locale}`}>← {locale === "fr" ? "Retour" : "Back"}</Link>
      </div>
    </main>
  );
}
