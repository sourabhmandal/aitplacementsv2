import {
  Button,
  Container,
  Loader,
  NumberInput,
  Paper,
  Select,
  SelectItem,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Role, UserStatus } from "@prisma/client";
import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useBackendApiContext } from "../../context/backend.api";
import { UpdateUserInput } from "../schema/user.schema";
import { authOptions } from "./api/auth/[...nextauth]";

interface IPropsOnboard {
  username: string | null;
  useremail: string | null;
  userstatus: UserStatus;
  userrole: Role;
}

const Onboard: NextPage<IPropsOnboard> = ({
  useremail,
  userstatus,
  userrole,
}) => {
  const router = useRouter();

  useEffect(() => {
    if (userstatus !== "INVITED") router.push("/dashboard");
  }, [userstatus, router]);

  const backend = useBackendApiContext();
  const clientSession = useSession();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/login");
  }, [router, clientSession.status]);

  const onboardUserMutation = backend?.onboardUserMutation;

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
  const { values, errors, setFieldValue, onSubmit } = useForm<UpdateUserInput>({
    initialValues: {
      name: "",
      email: useremail || "",
      regNo: undefined,
      year: "3",
      branch: "COMP",
      phoneNo: undefined,
    },

    validate: {
      name: (val: string) =>
        /^[a-z A-Z]+$/i.test(val) ? null : "Name cannot have numbers",
      regNo: (val: number) => {
        if (val < 10000 && val > 99999)
          return "please enter your valid 5 digit registration number";
        else "";
      },
      phoneNo: (val: number) =>
        /^\+?([789]{1})\)?([0-9]{4})[-. ]?([0-9]{5})$/.test(val.toString())
          ? null
          : "Please enter a valid 10 digit phone number starting with 7, 8 or 9",
    },
  });

  const handleFormSubmit = async (data: UpdateUserInput) => {
    const reqData: UpdateUserInput = {
      name: data.name,
      email: useremail || "",
      year: data.year,
      branch: data.branch as AvailableBranch,
      regNo: data.regNo,
      phoneNo: data.phoneNo,
    };
    onboardUserMutation?.mutate(reqData);
    await signIn("update-user", {
      email: useremail,
    });
  };

  useEffect(() => {
    console.log(values.phoneNo);
  }, [values]);

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
      <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
        <Text size="lg" weight={700}>
          Welcome to Ait Placements
        </Text>
        <Text size="sm" color="dimmed" weight={300}>
          please register yourself as {useremail} before you proceed
        </Text>
        <Space h={"md"} />

        <form
          onSubmit={onSubmit((data: UpdateUserInput) => handleFormSubmit(data))}
        >
          <Stack>
            <TextInput
              required
              label="Full Name"
              placeholder="john doe"
              value={values.name}
              onChange={(event) =>
                setFieldValue("name", event.currentTarget.value)
              }
              error={errors.name}
            />

            {userrole == "STUDENT" ? (
              <NumberInput
                //@ts-ignore
                required
                maxLength={5}
                hideControls
                label="Registration Number"
                placeholder="18255"
                parser={(value) => value?.replace(/[, a-zA-Z]+/g, "")}
                value={values.regNo}
                onChange={(event: number) => setFieldValue("regno", event)}
                error={errors.regNo}
              />
            ) : (
              <></>
            )}

            {userrole == "STUDENT" ? (
              <Select
                label="Year"
                placeholder="Current year"
                value={values.year}
                onChange={(val: AvailableYear) => setFieldValue("year", val)}
                data={yearList}
                required
              />
            ) : (
              <></>
            )}
            {userrole == "STUDENT" ? (
              <Select
                label="Branch"
                placeholder="Current Branch"
                value={values.branch}
                onChange={(val: AvailableBranch) =>
                  setFieldValue("branch", val)
                }
                data={branchList}
                required
              />
            ) : (
              <></>
            )}
            <NumberInput
              label="Phone Number"
              placeholder="93797-39879"
              value={values.phoneNo}
              icon={
                <Text size={13.7} ml={8} mt={0.3}>
                  +91
                </Text>
              }
              maxLength={11}
              parser={(value) => value?.replace(/[, a-zA-Z]+/g, "")}
              formatter={(value) =>
                !Number.isNaN(parseInt(value!))
                  ? `${value}`.replace(/\B(?=(\d{5})+(?!\d))/g, " ")
                  : ""
              }
              hideControls
              onChange={(event: number) => setFieldValue("phoneNo", event)}
              error={errors.phoneNo}
            />
          </Stack>
          <Button
            type="submit"
            my="xl"
            fullWidth
            color={"orange"}
            disabled={onboardUserMutation?.isLoading}
          >
            {onboardUserMutation?.isLoading ? (
              <Loader size={"sm"} color="yellow" />
            ) : (
              "SAVE"
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Onboard;

export const getServerSideProps = async (
  context: any
): Promise<GetStaticPropsResult<IPropsOnboard>> => {
  let session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      username: session.user?.name || null,
      useremail: session.user?.email || null,
      userstatus: session.user?.userStatus || null,
      userrole: session.user?.role || null,
    },
  };
};
