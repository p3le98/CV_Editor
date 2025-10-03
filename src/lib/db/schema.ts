export type CV = {
  id?: string;
  user_id: string;
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  sections: Array<{
    title: string;
    content: string[];
  }>;
  created_at?: string;
  updated_at?: string;
};
