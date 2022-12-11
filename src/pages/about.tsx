import { Container, Paper, Space, Text } from "@mantine/core";

import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const About: NextPage = () => {
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
        <Paper radius="md" p="xl" withBorder sx={{ minWidth: 800 }}>
          <Text size="lg" weight={700}>
            About
          </Text>
          <Text size="sm" color="dimmed" weight={300}>
            This website has been bootstraped by the well wishing alumnis of
            Army Institute of Technology. To help the students who are walking
            the toughest walk of their engineering studies.
          </Text>
          <Space h={"md"} />
          <Text size="sm" color="dimmed" weight={300}>
            We wish all the best to the students who are part of this platform.
          </Text>
        </Paper>
      </Container>
    </>
  );
};

export default About;
