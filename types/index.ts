export type ContentFile =
  | 'site.json'
  | 'banners.json'
  | 'categories.json'
  | 'products.json'
  | 'testimonials.json'
  | 'faq.json'
  | 'blog.json';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
