import {
  Button,
  Center,
  Container,
  Loader,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { NextPage } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Login: NextPage = (props: PaperProps) => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { values, onSubmit, errors, setFieldValue } = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleFormSubmit = async (data: {
    email: string;
    password: string;
  }) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (!res?.ok) {
      showNotification({
        title: "Error Occured",
        message: "User not found",
        color: "red",
      });
    } else {
      console.log(res);
      router.push("/user");
    }
    setButtonLoading(false);
  };

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

        <form onSubmit={onSubmit((data) => handleFormSubmit(data))}>
          <Stack>
            <TextInput
              required
              type={"email"}
              label="Email"
              placeholder="hello@mantine.dev"
              value={values.email}
              onChange={(event) =>
                setFieldValue("email", event.currentTarget.value)
              }
              error={errors.email && "Invalid email"}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={values.password}
              onChange={(event) =>
                setFieldValue("password", event.currentTarget.value)
              }
              error={
                errors.password &&
                "Password should include at least 6 characters"
              }
            />
          </Stack>
          <Button
            color="orange"
            type="submit"
            my="xl"
            fullWidth
            onClick={() => setButtonLoading(true)}
          >
            {buttonLoading ? <Loader size={"sm"} color="yellow" /> : "LOGIN"}
          </Button>
          <Center>
            <Link href="/register">
              <Text size="sm" color="dimmed" sx={{ cursor: "pointer" }}>
                Dont have an account? Register
              </Text>
            </Link>
          </Center>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
