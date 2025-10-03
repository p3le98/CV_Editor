import { supabase } from "@/lib/supabase";
import type { CV } from "./schema";

export const cvService = {
  async saveCV(cv: Omit<CV, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("cvs")
      .insert([cv])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCV(id: string, cv: Partial<CV>) {
    const { data, error } = await supabase
      .from("cvs")
      .update(cv)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCVs(userId: string) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCV(id: string) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCV(id: string) {
    const { error } = await supabase.from("cvs").delete().eq("id", id);

    if (error) throw error;
  },
};
