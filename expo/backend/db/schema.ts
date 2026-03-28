export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar: string | null;
  bio: string | null;
  visit_count: number;
  review_count: number;
  badges: string[];
  is_business: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string | null;
  hours: string | null;
  image: string;
  tags: string[];
  verified: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: string;
  cafe_id: string;
  user_id: string;
  rating_coffee: number;
  rating_seating: number;
  rating_noise: number;
  rating_environment: number;
  text: string;
  images: string[];
  helpful: number;
  created_at: string;
  updated_at: string;
}

export interface DbPromotion {
  id: string;
  business_id: string;
  cafe_id: string;
  title: string;
  description: string;
  image: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: string;
  user_id: string;
  cafe_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface DbVisit {
  id: string;
  user_id: string;
  cafe_id: string;
  visit_time: string;
  created_at: string;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
}

export interface DbBusyTime {
  id: string;
  cafe_id: string;
  day_of_week: number;
  hour: number;
  busy_level: number;
  sample_count: number;
  updated_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
