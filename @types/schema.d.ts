export type Tag = {
  color: string;
  id: string;
  name: string;
};

export type Notice = {
  id: string;
  slug: string;
  title: string;
  tags: Tag[];
  description: string;
  createdAt: Date;
  UpdatedAt: Date;
};
