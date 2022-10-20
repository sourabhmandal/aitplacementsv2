type APIErrorResponse = {
  ok: boolean;
  status: number;
  error?: string;
};

type APISuccessResponse = {
  ok: boolean;
  status: number;
  message?: string;
  data?: any;
};

type APIResponse = APIErrorResponse & APISuccessResponse;
type AvailableBranch = "COMP" | "IT" | "ENTC" | "MECH" | "MECH-ME";
type AvailableYear = "3" | "4";

type CreateNoticeForm = {
  title: string;
  body: string;
  isDraft: boolean;
};

type MultiSelectItem = {
  value: string;
  label: string;
};

type SavedFileOctokit = {
  filepath: string;
  sha: string;
  downloadUrl: string;
};
