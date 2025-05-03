export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface User {
  username: string;
}