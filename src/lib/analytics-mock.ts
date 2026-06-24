import type { AnalyticItem } from "@/app/analytics/types";

/** Demo data for UI-only / empty workspace preview */
export const MOCK_ANALYTICS: AnalyticItem[] = [
  {
    id: "mock-1",
    title: "Early Childhood Admissions",
    slug: "admissions-2026",
    views: 1840,
    isLandingPage: false,
    responses: 312,
    conversion: 17.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    title: "Parent Feedback Survey",
    slug: "parent-feedback",
    views: 920,
    isLandingPage: false,
    responses: 148,
    conversion: 16.1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    title: "Summer Camp Waitlist",
    slug: "summer-camp",
    views: 640,
    isLandingPage: false,
    responses: 89,
    conversion: 13.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    title: "Admissions Landing Page",
    slug: "admissions-hero",
    views: 2100,
    isLandingPage: true,
    connectedFormSlug: "admissions-2026",
    responses: 0,
    conversion: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-5",
    title: "Open Day Registration",
    slug: "open-day",
    views: 430,
    isLandingPage: false,
    responses: 67,
    conversion: 15.6,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_TREND_DATA = [
  { month: "Jan", Views: 420, Responses: 68 },
  { month: "Feb", Views: 580, Responses: 94 },
  { month: "Mar", Views: 710, Responses: 112 },
  { month: "Apr", Views: 890, Responses: 138 },
  { month: "May", Views: 1020, Responses: 165 },
  { month: "Jun", Views: 1180, Responses: 189 },
];
