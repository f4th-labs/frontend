export interface Category {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  email: string;
  fullName: string;
  lastName: string;
  role: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string | null;
  category: Category | null;
  author: Author | null;
  createdDate: string;
}
