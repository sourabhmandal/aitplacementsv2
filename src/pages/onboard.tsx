import {
  Button,
  Container,
  Loader,
  NumberInput,
  Paper,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Role, UserStatus } from "@prisma/client";
import { GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BRANCHES, YEAR, branchList, yearList } from "../schema/constants";
import { OnboardUserInput } from "../schema/user.schema";
import { trpc } from "../utils/trpc";
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
}: IPropsOnboard) => {
  const router = useRouter();

  useEffect(() => {
    if (userstatus === "INACTIVE") {
      showNotification({
        message: "Your account have been deactivated, please contact admin",
        title: "Account Inactive",
      });
    } else if (userstatus === "ACTIVE") router.push("/dashboard");
  }, [userstatus, router]);

  const clientSession = useSession();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/auth/login");
  }, [router, clientSession.status]);

  const onboardUserMutation = trpc.user.onboardUser.useMutation({
    onError: (error) => {
      showNotification({
        message: error.message,
        title: error.data?.code,
      });
    },
  });

  const { values, errors, setFieldValue, onSubmit } = useForm<OnboardUserInput>(
    {
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
        regNo: (val: number | undefined) => {
          if (val! < 10000 && val! > 99999)
            return "please enter your valid 5 digit registration number";
        },
        phoneNo: (val: string | undefined) => {
          if (val == "" || val == undefined) return null;
          else if (
            /^\+?([6789]{1})\)?([0-9]{4})[-. ]?([0-9]{5})$/.test(
              val?.toString()!
            )
          ) {
            return null;
          } else
            return "Please enter a valid 10 digit phone number starting with 6, 7, 8 or 9";
        },
      },
    }
  );

  const handleFormSubmit = async (data: OnboardUserInput) => {
    const reqData: OnboardUserInput = {
      name: data.name,
      email: useremail || "",
      year: data.year,
      branch: data.branch as BRANCHES,
      regNo: data.regNo,
      phoneNo: data.phoneNo,
    };
    console.log(data);
    onboardUserMutation?.mutate(reqData);
    await signIn("update-user", {
      email: useremail,
    });
  };

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
        {userstatus === "INVITED" ? (
          <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
            <Text size="lg" weight={700}>
              Welcome to Ait Placements
            </Text>
            <Text size="sm" color="dimmed" weight={300}>
              please register yourself as {useremail} before you proceed
            </Text>
            <Space h={"md"} />

            <form onSubmit={onSubmit((val, event) => handleFormSubmit(val))}>
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
                    onChange={(event: number) => setFieldValue("regNo", event)}
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
                    onChange={(val: YEAR) => setFieldValue("year", val)}
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
                    onChange={(val: BRANCHES) => setFieldValue("branch", val)}
                    data={branchList}
                    required
                  />
                ) : (
                  <></>
                )}
                <NumberInput
                  label="Phone Number"
                  required={false}
                  placeholder="93797-39879"
                  value={parseInt(values.phoneNo!)}
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
                  onChange={(event: number) =>
                    setFieldValue("phoneNo", event ? event.toString() : "")
                  }
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
        ) : (
          <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
            <Title align="center">Account Deactivated</Title>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Onboard;

export const getServerSideProps = async (
  context: any
): Promise<GetServerSidePropsResult<IPropsOnboard>> => {
  let session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
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
