export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/onboard",
    "/profile",
    "/users",
    "/notice",
    "/notice/:id",
  ],
};
