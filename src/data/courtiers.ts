export type Courtier = {
  name: string;
  slug: string;
  city: string;
  department: string;
  region: string;
  specialties: string[];
  description: string;
  website?: string;
  verifiedAt: string;
};

export const courtiers: Courtier[] = [];
