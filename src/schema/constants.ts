import { SelectItem } from "@mantine/core";
import { z } from "zod";

export const ACCEPTED_USER_STATUS = z.enum(["INACTIVE", "ACTIVE", "INVITED"]);
export type USER_STATUS = z.infer<typeof ACCEPTED_USER_STATUS>;

export const ACCEPTED_YEAR = z.enum(["3", "4"]);
export type YEAR = z.infer<typeof ACCEPTED_YEAR>;

export const ACCEPTED_BRANCHES = z.enum([
  "COMP",
  "ENTC",
  "IT",
  "MECH",
  "MECH-ME",
]);
export type BRANCHES = z.infer<typeof ACCEPTED_BRANCHES>;

export const ACCEPTED_ROLES = z.enum(["ADMIN", "STUDENT", "SUPER_ADMIN"]);
export type ROLES = z.infer<typeof ACCEPTED_ROLES>;

export const yearList: (string | SelectItem)[] = [
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];
export const branchList: SelectItem[] = [
  { value: "COMP", label: "Computer Science" },
  { value: "IT", label: "Information Technology" },
  { value: "ENTC", label: "Electronics and Telecommunication" },
  { value: "MECH", label: "Mechanical" },
  { value: "MECH-ME", label: "Mechnical (Masters)" },
];

export const defaultTagsList: MultiSelectItem[] = [
  { value: "COMP", label: "COMP" },
  { value: "IT", label: "IT" },
  { value: "ENTC", label: "ENTC" },
  { value: "MECH", label: "MECH" },
  { value: "ME-MECH", label: "ME-MECH" },
  { value: "TE BATCH", label: "TE BATCH" },
  { value: "BE BATCH", label: "BE BATCH" },
  { value: "ALL BATCHES", label: "ALL BATCHES" },
  { value: "INTERNSHIP", label: "INTERNSHIP" },
  { value: "FULL-TIME", label: "FULL-TIME" },
];

export interface MultiSelectItem {
  value: string;
  label: string;
}
