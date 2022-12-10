import {
  Button,
  Container,
  Loader,
  Paper,
  PaperProps,
  Text,
} from "@mantine/core";
import { IconLogin } from "@tabler/icons";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Login: NextPage = (props: PaperProps) => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { status } = useSession();

  const queryCallbackUrl: string =
    router.query.callbackUrl?.toString() || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(queryCallbackUrl);
    }
  }, [status, router]);

  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
        minHeight: "100vh",
      }}
    >
      <Paper radius="md" p="xl" withBorder {...props} sx={{ minWidth: 500 }}>
        <Text size="lg" weight={700}>
          Welcome Back
        </Text>

        <Button
          color="blue"
          my="xl"
          fullWidth
          onClick={async () => {
            setButtonLoading(true);
            await signIn("azure-ad", {
              redirect: true,
              callbackUrl: "/auth/login",
            });
            setButtonLoading(false);
          }}
          leftIcon={buttonLoading ? <></> : <IconLogin />}
        >
          {buttonLoading ? (
            <Loader size={"sm"} color="teal" />
          ) : (
            "LOGIN WITH MICROSOFT"
          )}
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
