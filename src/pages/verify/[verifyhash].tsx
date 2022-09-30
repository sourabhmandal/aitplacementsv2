import { Container, Loader, Space, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { VerifyEmailOutput } from "../../schema/verify.schema";
import { trpc } from "../../utils/trpc";

const Verify: NextPage = () => {
  const router = useRouter();
  const { verifyhash } = router.query;
  const verifyEmailMutation = trpc.useMutation<"verify.verify-email">(
    ["verify.verify-email"],
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
      onSuccess(data: VerifyEmailOutput) {
        showNotification({
          title: "Success",
          message: `User ${data.name} with email ${data.email} is ${
            data.isVerified ? "VERIFIED" : "NOT VERIFIED"
          }`,
          color: "green",
        });
        router.push("/login");
      },
    }
  );

  useEffect(() => {
    if (verifyhash) {
      verifyEmailMutation.mutate({ hash: verifyhash.toString() });
    }

    return () => {};
  }, [verifyhash]);

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
      <Loader variant="bars" color="orange" size={50} />
      <Space w="lg" />
      <Title order={3}>Verifying you email</Title>
    </Container>
  );
};

export default Verify;
