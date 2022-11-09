import { ColorScheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import superjson from "superjson";
import AppContainer from "../../components/AppContainer";
import { BackendApi } from "../../context/backend.api";
import { HOSTED_VERCEL_URL, LOCALHOST_URL } from "../utils/constants";
import { AppRouter } from "./api/server/routes/app.router";

//@ts-ignore
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [theme, setTheme] = useState<ColorScheme>("light");
  return (
    <>
      <Head>
        <title>Page title</title>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <SessionProvider session={session}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: theme,
            primaryColor: "orange",
          }}
        >
          <ModalsProvider>
            <NotificationsProvider limit={3}>
              <BackendApi>
                <AppContainer theme={theme} setTheme={setTheme}>
                  <Component {...pageProps} />
                </AppContainer>
              </BackendApi>
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `${HOSTED_VERCEL_URL}/api/trpc`
      : `${LOCALHOST_URL}/api/trpc`;

    const links = [
      loggerLink(),
      httpBatchLink({
        maxBatchSize: 10,
        url,
      }),
    ];

    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60,
          },
        },
      },
      headers() {
        const corsHeaders = {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin":
            ctx?.req?.headers.host?.toString() || "*",
          "Access-Control-Allow-Headers":
            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
        };

        if (ctx?.req?.method?.toString() === "OPTIONS") {
          ctx.res?.writeHead(200);
        }

        if (ctx?.req) {
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
            ...corsHeaders,
          };
        }
        return { ...corsHeaders };
      },
      links,
      transformer: superjson,
    };
  },
  ssr: true,
})(MyApp);
