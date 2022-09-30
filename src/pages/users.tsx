import {
  Button,
  Container,
  Divider,
  Loader,
  Modal,
  SimpleGrid,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { NextPage } from "next";
import { useState } from "react";
import { UserInfo } from "../../components/userinfo";
import Userinfolist from "../../components/userinfolist";
import { trpc } from "../utils/trpc";

const UserPage: NextPage = () => {
  const [students, setStudents] = useState<
    {
      avatar: string;
      name: string;
      email: string;
      role: string;
    }[]
  >([]);

  const adminListQuery = trpc.useQuery(["admin.get-admins"], {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });

  const studentListQuery = trpc.useQuery(["user.get-students"], {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
    onSuccess(data) {
      let students = data.map((item) => ({
        avatar: "https://picsum.photos/200",
        name: item.name,
        email: item.email,
        role: "Student",
      }));
      setStudents(students);
    },
  });

  const [openInviteAdminModal, setopenInviteAdminModal] =
    useState<boolean>(false);

  return (
    <Container>
      <Title order={3}>People in the Platform</Title>
      <Divider mt="sm" mb="xl" />
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
      <Button onClick={() => setopenInviteAdminModal(true)} fullWidth my="xl">
        ADD MORE ADMINS
      </Button>
      <InviteAdminModal
        openInviteAdminModal={openInviteAdminModal}
        setopenInviteAdminModal={setopenInviteAdminModal}
      />

      <Divider my="lg" variant="dashed" />
      <Userinfolist data={students} />
    </Container>
  );
};

export default UserPage;

function InviteAdminModal({
  openInviteAdminModal,
  setopenInviteAdminModal,
}: any) {
  const inviteUserMutation = trpc.useMutation(["admin.invite-admin"], {
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
      setopenInviteAdminModal(false);
    },
  });

  const form = useForm<{ email: string }>({
    initialValues: {
      email: "",
    },

    validate: {
      email: (val) =>
        /^\S+@aitpune.edu.in/.test(val)
          ? null
          : "Invalid email, use @aitpune.edu.in",
    },
  });
  const handleInviteSubmit = (data: { email: string }) => {
    // call query to invite user
    inviteUserMutation.mutate({ email: data.email });
    form.setFieldValue("email", "");
    setopenInviteAdminModal(false);
  };

  return (
    <Modal
      opened={openInviteAdminModal}
      onClose={() => setopenInviteAdminModal(false)}
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
        <Button fullWidth type="submit" mt="md">
          {inviteUserMutation.isLoading ? <Loader /> : "Send Invite"}
        </Button>
      </form>
    </Modal>
  );
}
