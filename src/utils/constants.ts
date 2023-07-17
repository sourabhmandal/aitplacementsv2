import { showNotification } from "@mantine/notifications";

export const showCommingSoon = () =>
  showNotification({
    title: "Comming Soon",
    message: "this feature is not available yet",
    color: "lime",
  });

export const NEXTAUTH_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
export const SECRET_PASSPHRASE = process.env.SECRET_PASSPHRASE;
export const DATABASE_URL = process.env.DATABASE_URL;

export const AIT_AWS_ACCESS_KEY = process.env.AIT_AWS_ACCESS_KEY;
export const AIT_AWS_SECRET_ACCESS_KEY = process.env.AIT_AWS_SECRET_ACCESS_KEY;
export const AIT_AWS_REGION = process.env.AIT_AWS_REGION;
export const AIT_AWS_BUCKET_ID = process.env.AIT_AWS_BUCKET_ID;

export const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
export const AZURE_AD_CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;
export const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID;

export let HOSTED_VERCEL_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV == "production"
    ? `https://v2.aitplacements.in`
    : process.env.NEXT_PUBLIC_VERCEL_ENV == "preview"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

export function createAWSFilePath(noticeId: string, filename: string): string {
  return `${noticeId}/${filename}`;
}
