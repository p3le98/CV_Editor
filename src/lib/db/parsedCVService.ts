import { supabase } from "@/lib/supabase";
import { PDFError } from "@/lib/errors";

export interface ParsedCV {
  id?: string;
  user_id: string;
  original_text: string;
  parsed_data: any;
  language: string;
  confidence_score: number;
  created_at?: string;
  updated_at?: string;
}

export const parsedCVService = {
  async saveParsedCV(
    parsedCV: Omit<ParsedCV, "id" | "created_at" | "updated_at">,
  ) {
    try {
      const { data, error } = await supabase
        .from("parsed_cvs")
        .insert([parsedCV])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving parsed CV:", error);
      throw new PDFError("Failed to save parsed CV data");
    }
  },

  async getParsedCVs(userId: string) {
    try {
      const { data, error } = await supabase
        .from("parsed_cvs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching parsed CVs:", error);
      throw new PDFError("Failed to fetch parsed CV data");
    }
  },

  async getParsedCV(id: string) {
    try {
      const { data, error } = await supabase
        .from("parsed_cvs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching parsed CV:", error);
      throw new PDFError("Failed to fetch parsed CV data");
    }
  },

  async updateParsedCV(id: string, updates: Partial<ParsedCV>) {
    try {
      const { data, error } = await supabase
        .from("parsed_cvs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating parsed CV:", error);
      throw new PDFError("Failed to update parsed CV data");
    }
  },

  async deleteParsedCV(id: string) {
    try {
      const { error } = await supabase.from("parsed_cvs").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting parsed CV:", error);
      throw new PDFError("Failed to delete parsed CV data");
    }
  },
};
