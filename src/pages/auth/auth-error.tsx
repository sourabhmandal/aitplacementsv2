import {
  Button,
  Container,
  createStyles,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const useStyles = createStyles((theme) => ({
  root: {
    height: "100%",
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor,
    }).background,
  },

  image: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.65,
  },

  content: {
    paddingTop: 220,
    position: "relative",
    zIndex: 1,

    [theme.fn.smallerThan("sm")]: {
      paddingTop: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: 38,
    color: theme.white,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 460,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
    color: theme.colors[theme.primaryColor][1],
  },
}));

interface IPageErorr {
  errorCode: string;
  error: string;
  message: string;
}

const AuthError: NextPage<{}> = () => {
  const { classes } = useStyles();
  const autherror: IPageErorr[] = useMemo(
    () => [
      {
        errorCode: "AccessDenied",
        error: "User Access Denied",
        message:
          "your email is not registered or being blocked by admin, please contact admin if issue persists",
      },
      {
        errorCode: "Configuration",
        error: "Authentication Configuration Issue",
        message:
          "improper configuration of authentication detected in the server, please contact admin if issue persists",
      },
      {
        errorCode: "Verification",
        error: "Session Token Expired",
        message:
          "user session has expired during login, please contact admin if issue persists",
      },
      {
        errorCode: "Default",
        error: "Unknown Error Occured",
        message:
          "something went wrong on our side, please contact admin if issue persists",
      },
    ],
    []
  );

  const router = useRouter();
  const errorQuery = router.query.error as string;
  const [displayedError, setdisplayedError] = useState<IPageErorr>();

  useEffect(() => {
    if (errorQuery) {
      const newError: IPageErorr = autherror.find(
        (data: IPageErorr) => data.errorCode == errorQuery
      ) as IPageErorr;

      if (newError) setdisplayedError(newError);
    }
  }, [errorQuery, autherror]);

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
      <Container fluid className={classes.root}>
        <Stack justify="center" align="center" style={{ height: "100%" }}>
          <Title className={classes.title}>{displayedError?.error}</Title>
          <Text size="lg" align="center" className={classes.description}>
            {displayedError?.message}
          </Text>
          <Group position="center">
            <Link href="/auth/login" passHref>
              <Button size="md" variant="white">
                Try Login again
              </Button>
            </Link>
          </Group>
        </Stack>
      </Container>
    </>
  );
};
export default AuthError;
