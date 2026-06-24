export interface AnalyticItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  isLandingPage: boolean;
  connectedFormSlug?: string;
  responses: number;
  conversion: number;
  createdAt: string;
}
