import {
  Button,
  Center,
  Container,
  Loader,
  NumberInput,
  Paper,
  PaperProps,
  PasswordInput,
  Select,
  SelectItem,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CreateUserInput } from "../schema/user.schema";
import { trpc } from "../utils/trpc";

const Register: NextPage = (props: PaperProps) => {
  const router = useRouter();

  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }

    return () => {};
  }, [status, router]);

  const { isLoading, mutate } = trpc.useMutation(["auth.register-user"], {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
    onSuccess(data) {
      showNotification({
        title: "Success",
        message: `User ${data.name} created with email ${data.email}`,
        color: "green",
      });
      router.push("/login");
    },
  });

  const yearList: (string | SelectItem)[] = [
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];
  const branchList: (string | SelectItem)[] = [
    { value: "COMP", label: "Computer Science" },
    { value: "IT", label: "Information Technology" },
    { value: "ENTC", label: "Electronics and Telecommunication" },
    { value: "MECH", label: "Mechanical" },
    { value: "MECH-ME", label: "Mechnical (Masters)" },
  ];
  const { values, errors, setFieldValue, onSubmit } = useForm({
    initialValues: {
      name: "",
      regno: 0,
      year: "3",
      branch: "COMP",
      email: "",
      setpassword: "",
      password: "",
    },

    validate: {
      email: (val) =>
        /^\S+@aitpune.edu.in/.test(val)
          ? null
          : "Invalid email, use @aitpune.edu.in",
      regno: (val) => {
        if (typeof val !== "number") {
          return "please enter a valid number";
        }
      },
      password: (val) => {
        let error = null;
        if (val.length < 6) {
          error = "Password should include at least 6 characters";
        }
        if (val !== values.setpassword) {
          error = "Password dont match";
        }
        console.log(error);
        return error;
      },
      setpassword: (val) => {
        let error = null;
        if (val.length < 6) {
          error = "Password should include at least 6 characters";
        }
        if (val !== values.password) {
          error = "Password dont match";
        }
        return error;
      },
    },
  });

  const handleFormSubmit = async (data: RegisterRequestType) => {
    const reqData: CreateUserInput = {
      name: data.name,
      email: data.email,
      year: parseInt(data.year),
      branch: data.branch as AvailableBranch,
      password: data.password,
      regno: data.regno,
    };

    mutate(reqData);
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
          Welcome to Ait Placements
        </Text>

        <form onSubmit={onSubmit((data) => handleFormSubmit(data))}>
          <Stack>
            <TextInput
              required
              label="Full Name"
              placeholder="sourabh mandal"
              value={values.name}
              onChange={(event) =>
                setFieldValue("name", event.currentTarget.value)
              }
              error={errors.name}
            />
            <TextInput
              required
              type={"email"}
              label="College Email"
              placeholder="hello@aitpune.edu.in"
              value={values.email}
              onChange={(event) =>
                setFieldValue("email", event.currentTarget.value)
              }
              error={errors.email}
            />

            <NumberInput
              //@ts-ignore
              type="number"
              required
              label="Registration Number"
              placeholder="18255"
              value={values.regno}
              onChange={(event: number) => setFieldValue("regno", event)}
            />

            <Select
              label="Year"
              placeholder="Current year"
              value={values.year}
              onChange={(val) => setFieldValue("branch", val || "")}
              data={yearList}
            />
            <Select
              label="Branch"
              placeholder="Current Branch"
              value={values.branch}
              onChange={(val) => setFieldValue("branch", val || "")}
              data={branchList}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={values.password}
              onChange={(event) =>
                setFieldValue("password", event.currentTarget.value)
              }
              error={errors.password}
            />

            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Your password"
              value={values.setpassword}
              onChange={(event) =>
                setFieldValue("setpassword", event.currentTarget.value)
              }
              error={errors.setpassword}
            />
          </Stack>
          <Button
            type="submit"
            my="xl"
            fullWidth
            color={"orange"}
            disabled={isLoading}
          >
            {isLoading ? <Loader size={"sm"} color="yellow" /> : "REGISTER"}
          </Button>
          <Center>
            <Link href="/login">
              <Text size="sm" color="dimmed" sx={{ cursor: "pointer" }}>
                Already have an account? Login
              </Text>
            </Link>
          </Center>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
