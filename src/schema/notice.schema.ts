import z from "zod";

export const createNoticeInput = z.object({
  id: z.string().uuid(),
  adminEmail: z.string().email(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z
    .string()
    .max(80, "Maximum title lenght should be 80 charachters long")
    .min(1, "Notice title cannot be empty"),
  body: z.string().min(1, "Notice body cannot be empty"),
  attachments: z.array(
    z.object({
      fileid: z.string(),
      filename: z.string(),
      filetype: z.string(),
    })
  ),
});
export type CreateNoticeInput = z.TypeOf<typeof createNoticeInput>;

export const createNoticeOutput = z.object({
  title: z.string(),
  adminEmail: z.string().email(),
  isPublished: z.boolean(),
});
export type CreateNoticeOutput = z.TypeOf<typeof createNoticeOutput>;

export const getNoticeListInput = z.object({
  pageNos: z.number(),
});
export type GetNoticeListInput = z.TypeOf<typeof getNoticeListInput>;
const noticeMetadata = z.object({
  id: z.string(),
  title: z.string(),
  admin: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  updatedAt: z.date(),
});
export type NoticeMetadata = z.TypeOf<typeof noticeMetadata>;

export const getNoticeListOutput = z.object({
  totalNotice: z.number(),
  notices: z.array(noticeMetadata),
});
export type GetNoticeListOutput = z.TypeOf<typeof getNoticeListOutput>;

export const updateNoticeInput = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z.string(),
  body: z.string(),
  attachments: z.array(z.string()),
});
export type UpdateNoticeInput = z.TypeOf<typeof updateNoticeInput>;

export const updateNoticeOutput = z.array(
  z.object({
    title: z.string(),
    admin: z.string(),
    tags: z.array(z.string()),
    updatedAt: z.string(),
  })
);
export type UpdateNoticeOutput = z.TypeOf<typeof updateNoticeOutput>;

export const getNoticeDetailInput = z.object({
  id: z.string(),
});
export type GetNoticeDetailInput = z.TypeOf<typeof getNoticeDetailInput>;

export const getNoticeDetailOutput = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  title: z.string(),
  body: z.string(),
  attachments: z.array(
    z.object({
      url: z.string(),
      name: z.string(),
      type: z.string(),
    })
  ),
});
export type GetNoticeDetailOutput = z.TypeOf<typeof getNoticeDetailOutput>;

export const createPresignedUrlInput = z.object({
  filepath: z.string(),
});
export type CreatePresignedUrlInput = z.TypeOf<typeof createPresignedUrlInput>;

export const changeNoticeStatusInput = z.object({
  noticeId: z.string().uuid(),
  isPublished: z.boolean(),
});
export type ChangeNoticeStatusInput = z.TypeOf<typeof changeNoticeStatusInput>;

export const changeNoticeStatusOutput = z.object({
  isPublished: z.boolean(),
});
export type ChangeNoticeStatusOutput = z.TypeOf<
  typeof changeNoticeStatusOutput
>;

export const deleteNoticeInput = z.object({
  noticeId: z.string().uuid(),
});
export type DeleteNoticeInput = z.TypeOf<typeof deleteNoticeInput>;

export const deleteNoticeOutput = z.object({
  isDeleted: z.boolean(),
});
export type DeleteNoticeOutput = z.TypeOf<typeof deleteNoticeOutput>;

export const userNoticeInput = z.object({
  email: z.string().email(),
  pageNos: z.number(),
});
export type UserNoticeInput = z.TypeOf<typeof userNoticeInput>;

export const userNoticeOutput = z.object({
  notice: z.array(noticeMetadata),
  count: z.number(),
});
export type UserNoticeOutput = z.TypeOf<typeof userNoticeOutput>;

export const noticeSearchInput = z.object({
  searchText: z.string(),
});
export type NoticeSearchInput = z.TypeOf<typeof noticeSearchInput>;