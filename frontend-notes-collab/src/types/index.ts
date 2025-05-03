export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;  // Assure-toi d'inclure createdAt ici
  updatedAt: string;
}

export interface User {
  username: string;
}

// types.ts
export interface Notification {
  message: string;
  author: string;
  createdAt: string;
}
