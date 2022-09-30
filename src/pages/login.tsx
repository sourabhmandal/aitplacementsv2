import {
  Button,
  Center,
  Container,
  Loader,
  Paper,
  PaperProps,
  PasswordInput,
  Radio,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import _ from "lodash";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
const Login: NextPage = (props: PaperProps) => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }

    return () => {};
  }, [status, router]);

  const { values, onSubmit, errors, setFieldValue } = useForm({
    initialValues: {
      email: "",
      password: "",
      role: "student",
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
    role: string;
  }) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (!res?.ok) {
      showNotification({
        title: "Error Occured",
        message: "either user not registered or unverified",
        color: "red",
      });
    } else {
      console.log(res);
      router.push("/dashboard");
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
              onChange={(event) => setFieldValue("email", event.target.value)}
              error={errors.email && "Invalid email"}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={values.password}
              onChange={(event) =>
                setFieldValue("password", event.target.value)
              }
              error={
                errors.password &&
                "Password should include at least 6 characters"
              }
            />
          </Stack>

          <Radio.Group
            label="Login as an student/admin?"
            required
            mt={"lg"}
            value={values.role}
            onChange={(e: string) => {
              setFieldValue("role", e);
            }}
          >
            <Radio value="student" label="Student" />
            <Radio value="admin" label="Admin" />
          </Radio.Group>
          <Button
            color="orange"
            type="submit"
            my="xl"
            fullWidth
            onClick={() => (_.isEmpty(errors) ? setButtonLoading(false) : null)}
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
};;

export default Login;
