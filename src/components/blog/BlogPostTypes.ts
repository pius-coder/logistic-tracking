export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
  published: boolean;
  publishedAt: string | null;
  tags: string;
  type: string;
  metaTitle: string;
  metaDesc: string;
}

export interface BlogPostData {
  post: BlogPostItem | null;
}

export interface BlogPostParams {
  slug: string;
}
