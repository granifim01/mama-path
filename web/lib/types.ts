export type HospitalService = {
  title: string;
  price_raw?: string | null;
  price_from?: number | null;
};

export type HospitalReview = {
  source: string;
  text: string;
  author?: string | null;
  rating?: number | null;
  date?: string | null;
};

export type HospitalSource = {
  source: string;
  source_id?: string;
  source_url?: string;
  detail_url?: string;
};

export type Hospital = {
  id: string;
  city_slug: string;
  city_name: string;
  name: string;
  facility_type: "public" | "private" | "unknown" | string;
  facility_type_label?: string | null;
  address?: string | null;
  phone?: string | null;
  rating?: number | null;
  doctors_count?: number | null;
  schedule?: string | null;
  description?: string | null;
  has_paid_birth?: boolean | null;
  free_birth_available?: boolean | null;
  services: HospitalService[];
  reviews: HospitalReview[];
  sources: HospitalSource[];
  source_count: number;
  lat?: number | null;
  lng?: number | null;
};

export type HospitalsPayload = {
  updated_at: string;
  count: number;
  hospitals: Hospital[];
};
