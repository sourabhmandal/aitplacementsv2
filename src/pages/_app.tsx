import { ColorScheme, MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import AppContainer from "../components/AppContainer";


function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [theme, setTheme] = useState<ColorScheme>(useColorScheme());

  useEffect(() => {
    if (window !== undefined) {
      const savedTheme = localStorage.getItem("theme") as ColorScheme;
      setTheme(savedTheme);

      if (savedTheme == undefined || savedTheme == null) {
        localStorage.setItem("theme", theme);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <>
      <Head>
        <title>AIT Placements</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1,initial-scale=1, width=device-width"
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
              <AppContainer theme={theme} setTheme={setTheme}>
                <Component {...pageProps} />
                <Analytics />
              </AppContainer>
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}

export default trpc.withTRPC(App);
