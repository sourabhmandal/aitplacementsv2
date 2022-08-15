type RegisterRequestType = {
  name: string;
  regno: number;
  year: string;
  branch: string;
  email: string;
  setpassword?: string;
  password: string;
};

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
