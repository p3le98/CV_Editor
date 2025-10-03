import { supabase } from "@/lib/supabase";

export const shareService = {
  async createShareLink(cvId: string) {
    const { data, error } = await supabase
      .from("cv_shares")
      .insert([
        {
          cv_id: cvId,
          share_id: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSharedCV(shareId: string) {
    const { data: shareData, error: shareError } = await supabase
      .from("cv_shares")
      .select("*, cvs(*)")
      .eq("share_id", shareId)
      .single();

    if (shareError) throw shareError;
    if (!shareData) throw new Error("Share link not found");

    const now = new Date();
    if (new Date(shareData.expires_at) < now) {
      throw new Error("Share link has expired");
    }

    return shareData.cvs;
  },

  async revokeShareLink(shareId: string) {
    const { error } = await supabase
      .from("cv_shares")
      .delete()
      .eq("share_id", shareId);

    if (error) throw error;
  },
};
