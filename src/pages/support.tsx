import { Container, Paper, Space, Text } from "@mantine/core";

import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Support: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>AIT Placements</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
          minHeight: "100vh",
        }}
      >
        <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
          <Text size="lg" weight={700}>
            Support
          </Text>
          <Text size="sm" color="dimmed" weight={300}>
            contact on following email for any issues
          </Text>
          <Space h={"md"} />
          <Link href="mailto:tpo@aitpune.edu.in">
            <Text size="sm" color="orange" weight={300}>
              tpo@aitpune.edu.in
            </Text>
          </Link>
        </Paper>
      </Container>
    </>
  );
};

export default Support;
