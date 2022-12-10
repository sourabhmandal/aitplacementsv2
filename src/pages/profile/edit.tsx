import {
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  Space,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Role } from "@prisma/client";
import { GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BRANCHES, branchList, YEAR, yearList } from "../../schema/constants";
import { UpdateUserInput } from "../../schema/user.schema";
import { trpc } from "../../utils/trpc";
import { authOptions } from "../api/auth/[...nextauth]";

interface IPropsOnboard {
  username: string | null;
  useremail: string | null;
  userrole: Role;
}

const Profile: NextPage<IPropsOnboard> = ({ useremail, userrole }) => {
  const userDetailsQuery = trpc.user["getUserProfileDetails"].useQuery(
    undefined,
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    }
  );

  const trpcContext = trpc.useContext();
  const clientSession = useSession();
  const router = useRouter();
  const updateUserMutation = trpc.user["updateUserProfile"].useMutation({
    onSuccess(data, variables, context) {
      showNotification({
        title: "User data updated",
        message: `data for ${data.name} updated`,
      });
    },
  });

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/auth/login");
  }, [router, clientSession.status]);

  useEffect(() => {
    setValues({
      name: userDetailsQuery.data?.name,
      phoneNo: userDetailsQuery.data?.phoneNo,
    });
    if (userDetailsQuery.data?.studentDetails) {
      setValues({
        branch: userDetailsQuery.data?.studentDetails?.branch! as BRANCHES,
        regNo: userDetailsQuery.data?.studentDetails?.registrationNumber,
        year: userDetailsQuery.data?.studentDetails?.year,
      });
    }
  }, [userDetailsQuery.data, userDetailsQuery.isSuccess]);

  const { values, errors, setValues, setFieldValue, onSubmit } =
    useForm<UpdateUserInput>({
      initialValues: {
        name: "",
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
          else "";
        },
        phoneNo: (val: string | undefined) =>
          /^\+?([789]{1})\)?([0-9]{4})[-. ]?([0-9]{5})$/.test(val?.toString()!)
            ? null
            : "Please enter a valid 10 digit phone number starting with 7, 8 or 9",
      },
    });

  const handleFormSubmit = async (data: UpdateUserInput) => {
    let reqData: UpdateUserInput;
    if (userrole == "ADMIN") {
      reqData = {
        name: data.name,
        phoneNo: data.phoneNo,
      };
    } else {
      reqData = {
        name: data.name,
        year: data.year,
        branch: data.branch as BRANCHES,
        regNo: data.regNo,
        phoneNo: data.phoneNo,
      };
    }
    updateUserMutation?.mutate(reqData);
    trpcContext.user["getUserProfileDetails"].invalidate();
  };

  if (userDetailsQuery.status == "loading")
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <Container>
      <form
        onSubmit={onSubmit((data: UpdateUserInput) => handleFormSubmit(data))}
      >
        <Group position="apart" noWrap>
          <Title my="md" order={3}>
            Your profile
          </Title>
          <Badge size="lg">{userDetailsQuery.data?.userStatus}</Badge>
        </Group>

        <Divider mb="lg" />
        <Avatar src={"https://picsum.photos/200"} size={200} radius="md" />
        <Divider my="lg" />
        <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
          <Title>Basic Details</Title>

          <TextInput
            label={"Email"}
            defaultValue={userDetailsQuery.data?.email}
            my="lg"
            disabled
          />

          <TextInput
            label={"Name"}
            value={values.name}
            my="lg"
            onChange={(event) =>
              setFieldValue("name", event.currentTarget.value)
            }
            error={errors.name}
          />

          <NumberInput
            label="Phone Number"
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
              setFieldValue("phoneNo", event.toString())
            }
            error={errors.phoneNo}
          />

          <TextInput
            label={"Platform Role"}
            my="lg"
            defaultValue={userDetailsQuery.data?.role}
            disabled
          />
        </Paper>
        <Space h="sm" />
        {userrole == "STUDENT" && userDetailsQuery.data?.studentDetails ? (
          <Paper radius="md" p="xl" withBorder sx={{ minWidth: 500 }}>
            <Title>Aditional Details</Title>
            <NumberInput
              required
              maxLength={5}
              hideControls
              label="Registration Number"
              placeholder="18255"
              parser={(value) => value?.replace(/[, a-zA-Z]+/g, "")}
              value={values.regNo}
              onChange={(event: number) => setFieldValue("regno", event)}
              error={errors.regNo}
              my="lg"
            />
            <Select
              label="Year"
              placeholder="Current year"
              value={values.year}
              onChange={(val: YEAR) => setFieldValue("year", val)}
              data={yearList}
              required
              my="lg"
            />

            <Select
              label="Branch"
              placeholder="Current Branch"
              value={values.branch}
              onChange={(val: BRANCHES) => setFieldValue("branch", val)}
              data={branchList}
              required
              my="lg"
            />
          </Paper>
        ) : (
          <></>
        )}
        <Center my="xl">
          <Button
            type="submit"
            my="xl"
            fullWidth
            color={"orange"}
            disabled={updateUserMutation?.isLoading}
          >
            {updateUserMutation?.isLoading ? (
              <Loader size={"sm"} color="yellow" />
            ) : (
              "Update Profile"
            )}
          </Button>
        </Center>
      </form>
    </Container>
  );
};

export default Profile;

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

  if (session.user.userStatus == "INVITED")
    return {
      redirect: {
        destination: "/onboard",
        permanent: false,
      },
    };

  return {
    props: {
      username: session.user?.name || null,
      useremail: session.user?.email || null,
      userrole: session.user?.role || null,
    },
  };
};
