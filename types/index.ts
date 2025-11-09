export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  image: string;
  ratings: CafeRatings;
  tags: string[];
  description?: string;
  hours?: string;
  verified?: boolean;
}

export interface CafeRatings {
  overall: number;
  coffee: number;
  seating: number;
  noise: number;
  environment: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  cafeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  ratings: {
    coffee: number;
    seating: number;
    noise: number;
    environment: number;
  };
  text: string;
  images?: string[];
  createdAt: string;
  helpful: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  cafeId: string;
  cafeName: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  likes: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  visitCount: number;
  reviewCount: number;
  badges: string[];
  isBusiness: boolean;
}
