import z from "zod";
import {
  ACCEPTED_BRANCHES,
  ACCEPTED_ROLES,
  ACCEPTED_USER_STATUS,
  ACCEPTED_YEAR,
} from "./constants";

export const updateUserInput = z.object({
  email: z.string().email(), // to search the user to update
  name: z.string(),
  regNo: z.number().optional(),
  year: ACCEPTED_YEAR.optional(),
  branch: ACCEPTED_BRANCHES.optional(),
  phoneNo: z.number().optional(),
});
export type UpdateUserInput = z.TypeOf<typeof updateUserInput>;

export const updateUserOutput = z.object({
  name: z.string(),
  email: z.string().email(),
  role: ACCEPTED_ROLES,
});
export type UpdateUserOutput = z.TypeOf<typeof updateUserOutput>;

export const userListInput = z.object({
  role: ACCEPTED_ROLES,
});
export type UserListInput = z.TypeOf<typeof userListInput>;

export const userListOutput = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phoneNo: z.string(),
    role: ACCEPTED_ROLES,
    userStatus: ACCEPTED_USER_STATUS,
  })
);
export type UserListOutput = z.TypeOf<typeof userListOutput>;

export const userDetailsInput = z.object({
  email: z.string().email(),
});
export type UserDetailsInput = z.TypeOf<typeof userDetailsInput>;

export const userDetailsOutput = z.object({
  name: z.string(),
  email: z.string().email(),
  phoneNo: z.string(),
  role: ACCEPTED_ROLES,
  userStatus: ACCEPTED_USER_STATUS,
  adminDetails: z.object({}).optional(),
  studentDetails: z
    .object({
      branch: z.string(),
      registrationNumber: z.number(),
      year: z.number(),
    })
    .optional(),
});
export type UserDetailsOutput = z.TypeOf<typeof userDetailsOutput>;

export const userRoleInput = z.object({
  id: z.string().uuid(),
  role: ACCEPTED_ROLES,
});
export type UserRoleInput = z.TypeOf<typeof userRoleInput>;

export const userRoleOutput = z.object({
  email: z.string().email(),
  role: ACCEPTED_ROLES,
});
export type UserRoleOutput = z.TypeOf<typeof userRoleOutput>;

export const userDeleteInput = z.object({
  id: z.string().uuid(),
});
export type UserDeleteInput = z.TypeOf<typeof userDeleteInput>;

export const userDeleteOutput = z.object({
  email: z.string().email(),
});
export type UserDeleteOutput = z.TypeOf<typeof userDeleteOutput>;

export const userSearchInput = z.object({
  searchText: z.string(),
});
export type UserSearchInput = z.TypeOf<typeof userSearchInput>;