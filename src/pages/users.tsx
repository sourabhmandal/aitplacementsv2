import {
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Radio,
  SimpleGrid,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  openSpotlight,
  registerSpotlightActions,
  SpotlightAction,
  SpotlightProvider,
} from "@mantine/spotlight";
import { Role } from "@prisma/client";
import { IconSearch, IconUserCircle } from "@tabler/icons";
import { debounce, DebouncedFunc } from "lodash";
import { GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { UserInfo } from "../../components/userinfo";
import Userinfolist from "../../components/userinfolist";
import { useBackendApiContext } from "../../context/backend.api";
import { InviteUserInput } from "../schema/admin.schema";
import { ROLES } from "../schema/constants";
import { authOptions } from "./api/auth/[...nextauth]";

interface IUserProps {
  userrole: Role;
}
export type UsersTableProps = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  role: string;
  userStatus: string;
};

const UserPage: NextPage<IUserProps> = ({ userrole }) => {
  const [openInviteUserModal, setopenInviteUserModal] =
    useState<boolean>(false);
  const backend = useBackendApiContext();
  const adminListQuery = backend?.userListQuery("ADMIN");
  const studentListQuery = backend?.userListQuery("STUDENT");

  useEffect(() => {
    adminListQuery?.refetch();
    studentListQuery?.refetch();
  }, [
    backend?.changeUserRoleMutation.isSuccess,
    backend?.deleteUserMutation.isSuccess,
    backend?.inviteUserMutation.isSuccess,
  ]);

  const clientSession = useSession();
  const router = useRouter();
  const searchedNotice: SpotlightAction[] = [];

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/login");
  }, [router, clientSession.status]);

  // for searching
  useEffect(() => {
    if (backend?.searchUserByEmail.isSuccess) {
      //@ts-ignore
      const search: SpotlightAction[] = backend?.searchUserByEmail.data.map(
        (el) => {
          return {
            title: el.email,
            icon: <IconUserCircle />,
            onTrigger: () => {
              // TODO
              // redirect to user profile page
              // without showing phone number
            },
            description: `Role: ${el.role.toUpperCase()}, Status: ${el.userStatus.toUpperCase()}`,
          };
        }
      );
      registerSpotlightActions(search);
    }
  }, [backend?.searchUserByEmail.isSuccess]);
  // debounce searching
  const handleTextSearch: DebouncedFunc<(query: string) => void> = debounce(
    (query) => {
      backend?.searchUserByEmail.mutate({
        searchText: query,
      });
    },
    800,
    { trailing: true, leading: false }
  );

  return (
    <Container>
      <Title order={3}>People in the Platform</Title>
      <SpotlightProvider
        actions={searchedNotice}
        searchIcon={<IconSearch size={18} />}
        searchPlaceholder="Search..."
        shortcut="mod + ctrl + F"
        nothingFoundMessage="Nothing found..."
        onQueryChange={(query) => handleTextSearch(query)}
        highlightQuery
        limit={100}
      >
        <Group position="center">
          <UnstyledButton
            sx={{
              border: 1,
              borderRadius: "0.5em",
              borderStyle: "solid",
              borderColor: "#ddd",
              marginTop: 15,
              marginBottom: 15,
              width: "100%",
            }}
            onClick={() => openSpotlight()}
          >
            <Group p={10}>
              <IconSearch size={16} style={{ color: "#ddd" }} />
              <Text color="dimmed" size="sm">
                Search
              </Text>
            </Group>
          </UnstyledButton>
        </Group>
      </SpotlightProvider>
      <Divider mt="sm" mb="xl" />
      {userrole == "ADMIN" ? (
        <>
          <Button
            onClick={() => setopenInviteUserModal(true)}
            fullWidth
            my="xl"
          >
            ADD MORE USERS
          </Button>
          <InviteUserModal
            openInviteUserModal={openInviteUserModal}
            setopenInviteUserModal={setopenInviteUserModal}
          />

          <Divider my="lg" variant="dashed" />
        </>
      ) : (
        <></>
      )}
      <SimpleGrid spacing="xl" cols={2}>
        {adminListQuery?.data?.map((item) => (
          <UserInfo
            key={item.id}
            id={item.id}
            avatar={"https://picsum.photos/200"}
            name={item.name}
            title={item.role}
            phone={item.phoneNo}
            email={item.email}
            userstatus={item.userStatus}
            sessionUserRole={userrole}
          />
        ))}
      </SimpleGrid>
      <Userinfolist students={studentListQuery?.data} userrole={userrole} />
    </Container>
  );
};

export default UserPage;

function InviteUserModal({ openInviteUserModal, setopenInviteUserModal }: any) {
  const backend = useBackendApiContext();

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
    backend?.inviteUserMutation.mutate(data);
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
          {backend?.inviteUserMutation.isLoading ? <Loader /> : "Send Invite"}
        </Button>
      </form>
    </Modal>
  );
}

export const getServerSideProps = async (
  context: any
): Promise<GetServerSidePropsResult<IUserProps>> => {
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
      userrole: session.user.role,
    },
  };
};
