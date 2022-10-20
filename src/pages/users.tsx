import {
  Button,
  Container,
  Divider,
  Loader,
  Modal,
  Radio,
  SimpleGrid,
  TextInput,
  Title
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { UserInfo } from "../../components/userinfo";
import Userinfolist from "../../components/userinfolist";
import { InviteUserInput } from "../schema/admin.schema";
import { ROLES } from "../schema/constants";
import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";

interface IUserProps {}
export type UsersTableProps = {
  avatar: string;
  name: string;
  email: string;
  role: string;
  userStatus: string;
};

const UserPage: NextPage<IUserProps> = () => {
  const adminListQuery = trpc.useQuery(
    ["user.get-user-list", { role: "ADMIN" }],
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

  const [students, setStudents] = useState<UsersTableProps[]>(
    new Array<UsersTableProps>(0)
  );

  trpc.useQuery(["user.get-user-list", { role: "STUDENT" }], {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
    onSuccess(data) {
      let students = data.map(
        (item): UsersTableProps => ({
          avatar: "https://picsum.photos/200",
          name: item.name,
          email: item.email,
          role: item.role,
          userStatus: item.userStatus,
        })
      );
      setStudents(students);
    },
  });

  const [openInviteUserModal, setopenInviteUserModal] =
    useState<boolean>(false);

  return (
    <Container>
      <Title order={3}>People in the Platform</Title>
      <Divider mt="sm" mb="xl" />
      <Button onClick={() => setopenInviteUserModal(true)} fullWidth my="xl">
        ADD MORE USERS
      </Button>
      <SimpleGrid spacing="xl" cols={2}>
        {adminListQuery.data?.map((item) => (
          <UserInfo
            key={item.email}
            avatar={"https://picsum.photos/200"}
            name={item.name}
            title={item.role}
            phone={item.phoneNo}
            email={item.email}
          />
        ))}
      </SimpleGrid>

      <InviteUserModal
        openInviteUserModal={openInviteUserModal}
        setopenInviteUserModal={setopenInviteUserModal}
      />

      <Divider my="lg" variant="dashed" />
      <Userinfolist students={students} />
    </Container>
  );
};

export default UserPage;

function InviteUserModal({ openInviteUserModal, setopenInviteUserModal }: any) {
  const inviteUserMutation = trpc.useMutation(["user.invite-user"], {
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
        message: `"${data.email}" is invited as admin`,
        color: "green",
      });
      setopenInviteUserModal(false);
    },
  });

  const form = useForm<InviteUserInput>({
    initialValues: {
      email: "",
      role: "STUDENT",
    },

    validate: {
      email: (val) =>
        /^\S+@aitpune.edu.in/.test(val)
          ? null
          : "Invalid email, use @aitpune.edu.in",
    },
  });
  const handleInviteSubmit = (data: InviteUserInput) => {
    // call query to invite user
    inviteUserMutation.mutate(data);
    form.setFieldValue("email", "");
    setopenInviteUserModal(false);
  };

  return (
    <Modal
      opened={openInviteUserModal}
      onClose={() => setopenInviteUserModal(false)}
      title="Send Invite to join AIT Placements as admin"
    >
      <form onSubmit={form.onSubmit((data) => handleInviteSubmit(data))}>
        <TextInput
          required
          label="Invite Email"
          type="email"
          placeholder="hello@gmail.com"
          value={form.values.email}
          onChange={(e) => {
            console.log(e.target.value);
            form.setFieldValue("email", e.target.value);
          }}
          error={form.errors.email}
        />
        <Radio.Group
          value={form.values.role}
          onChange={(event) => form.setFieldValue("role", event as ROLES)}
          name="userRole"
          label="Invite user as?"
          description="Only performable by admins and super admins"
          withAsterisk
          mt={20}
        >
          <Radio value={"STUDENT"} label="Student" />
          <Radio value={"ADMIN"} label="Admin" />
        </Radio.Group>
        <Button fullWidth type="submit" mt="md">
          {inviteUserMutation.isLoading ? <Loader /> : "Send Invite"}
        </Button>
      </form>
    </Modal>
  );
}

export const getServerSideProps = async (
  context: any
): Promise<GetStaticPropsResult<IUserProps>> => {
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
    props: {},
  };
};