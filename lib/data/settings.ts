import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { TournamentSettings } from "@/types";

// Never throws: the header, footer and metadata must render even before
// Supabase is configured.
export const getSettings = cache(async (): Promise<TournamentSettings> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tournament_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[settings]", error.message);
      return DEFAULT_SETTINGS;
    }
    return (data as TournamentSettings | null) ?? DEFAULT_SETTINGS;
  } catch (err) {
    console.error("[settings]", err);
    return DEFAULT_SETTINGS;
  }
});
