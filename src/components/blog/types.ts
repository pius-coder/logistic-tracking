export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
  tags: string;
  type: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface BlogListData {
  posts: BlogListItem[];
}
