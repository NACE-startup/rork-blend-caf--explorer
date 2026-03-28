import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";

import signupRoute from "@/backend/trpc/routes/auth/signup/route";
import loginRoute from "@/backend/trpc/routes/auth/login/route";
import logoutRoute from "@/backend/trpc/routes/auth/logout/route";
import meRoute from "@/backend/trpc/routes/auth/me/route";

import listCafesRoute from "@/backend/trpc/routes/cafes/list/route";
import cafeByIdRoute from "@/backend/trpc/routes/cafes/byId/route";
import nearbyCafesRoute from "@/backend/trpc/routes/cafes/nearby/route";
import searchCafesRoute from "@/backend/trpc/routes/cafes/search/route";
import busyTimesRoute from "@/backend/trpc/routes/cafes/busyTimes/route";
import visitorCountRoute from "@/backend/trpc/routes/cafes/visitorCount/route";

import createReviewRoute from "@/backend/trpc/routes/reviews/create/route";
import reviewsByCafeRoute from "@/backend/trpc/routes/reviews/byCafe/route";
import reviewsByUserRoute from "@/backend/trpc/routes/reviews/byUser/route";

import createVisitRoute from "@/backend/trpc/routes/visits/create/route";
import visitsByUserRoute from "@/backend/trpc/routes/visits/byUser/route";

import createPromotionRoute from "@/backend/trpc/routes/promotions/create/route";
import promotionsByCafeRoute from "@/backend/trpc/routes/promotions/byCafe/route";
import promotionsByBusinessRoute from "@/backend/trpc/routes/promotions/byBusiness/route";

import createPostRoute from "@/backend/trpc/routes/posts/create/route";
import postsFeedRoute from "@/backend/trpc/routes/posts/feed/route";

import cafeStatsRoute from "@/backend/trpc/routes/analytics/cafeStats/route";

import addFavoriteRoute from "@/backend/trpc/routes/favorites/add/route";
import removeFavoriteRoute from "@/backend/trpc/routes/favorites/remove/route";
import listFavoritesRoute from "@/backend/trpc/routes/favorites/list/route";
import checkFavoriteRoute from "@/backend/trpc/routes/favorites/check/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signup: signupRoute,
    login: loginRoute,
    logout: logoutRoute,
    me: meRoute,
  }),
  cafes: createTRPCRouter({
    list: listCafesRoute,
    byId: cafeByIdRoute,
    nearby: nearbyCafesRoute,
    search: searchCafesRoute,
    busyTimes: busyTimesRoute,
    visitorCount: visitorCountRoute,
  }),
  reviews: createTRPCRouter({
    create: createReviewRoute,
    byCafe: reviewsByCafeRoute,
    byUser: reviewsByUserRoute,
  }),
  visits: createTRPCRouter({
    create: createVisitRoute,
    byUser: visitsByUserRoute,
  }),
  promotions: createTRPCRouter({
    create: createPromotionRoute,
    byCafe: promotionsByCafeRoute,
    byBusiness: promotionsByBusinessRoute,
  }),
  posts: createTRPCRouter({
    create: createPostRoute,
    feed: postsFeedRoute,
  }),
  analytics: createTRPCRouter({
    cafeStats: cafeStatsRoute,
  }),
  favorites: createTRPCRouter({
    add: addFavoriteRoute,
    remove: removeFavoriteRoute,
    list: listFavoritesRoute,
    check: checkFavoriteRoute,
  }),
});

export type AppRouter = typeof appRouter;
