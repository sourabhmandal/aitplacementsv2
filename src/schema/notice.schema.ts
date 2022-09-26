import z from "zod";

export const createNoticeInput = z.object({
  adminEmail: z.string().email(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z
    .string()
    .max(80, "Maximum title lenght should be 80 charachters long")
    .min(1, "Notice title cannot be empty"),
  body: z.string().min(1, "Notice body cannot be empty"),
  attachments: z.array(z.string()),
});

export const createNoticeOutput = z.object({
  title: z.string(),
  adminEmail: z.string().email(),
  isPublished: z.boolean(),
});

export const getNoticeListInput = z.object({
  pageNos: z.number(),
});

export const getNoticeListOutput = z.object({
  totalNotice: z.number(),
  notices: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      admin: z.string(),
      tags: z.array(z.string()),
      updatedAt: z.date(),
    })
  ),
});

export const updateNoticeInput = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z.string(),
  body: z.string(),
  attachments: z.array(z.string()),
});

export const updateNoticeOutput = z.array(
  z.object({
    title: z.string(),
    admin: z.string(),
    tags: z.array(z.string()),
    updatedAt: z.string(),
  })
);

export const getNoticeDetailInput = z.object({
  id: z.string(),
});

export const getNoticeDetailOutput = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z.string(),
  body: z.string(),
  attachments: z.array(z.string()),
});
