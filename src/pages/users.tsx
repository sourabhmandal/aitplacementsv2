import {
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Pagination,
  Radio,
  SimpleGrid,
  Space,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
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
import { InviteUserInput } from "../schema/admin.schema";
import { ROLES } from "../schema/constants";
import { trpc } from "../utils/trpc";
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
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const trpcContext = trpc.useContext();

  const adminListQuery = trpc.user["getUserList"].useQuery({
    role: "ADMIN",
    pageNos: pageNos,
  });

  const studentListQuery = trpc.user["getUserList"].useQuery({
    role: "STUDENT",
    pageNos: pageNos,
  });

  const searchUserByEmail = trpc.user["searchUserByEmail"].useMutation();
  const inviteUserMutation = trpc.user["inviteUser"].useMutation({
    onSuccess: (data) => {
      trpcContext.user["getUserList"].invalidate();
      return showNotification({
        title: "Invitation email sent",
        message: `${data.email} invited to the platform`,
      });
    },
    onError: (error) => {
      trpcContext.user["getUserList"].invalidate();
      return showNotification({
        title: error.data?.code,
        message: error.message,
      });
    },
  });

  useEffect(() => {
    trpcContext.user["getUserList"].invalidate();
  }, [inviteUserMutation.isSuccess]);

  useEffect(() => {
    if (studentListQuery?.isSuccess) {
      // setnoticeList(studentListQuery?.data?.notice!);
      let pages = Math.ceil(studentListQuery?.data?.count! / 10);
      if (pages == 0) pages += 1;
      settotalPages(pages);
    }
  }, [
    studentListQuery?.isSuccess,
    studentListQuery?.data?.users,
    studentListQuery?.data?.count,
    studentListQuery?.isFetched,
  ]);

  const clientSession = useSession();
  const router = useRouter();
  const searchedNotice: SpotlightAction[] = [];

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/auth/login");
  }, [router, clientSession.status]);

  // for searching
  useEffect(() => {
    if (searchUserByEmail.isSuccess) {
      const searchResult: SpotlightAction[] = searchUserByEmail.data.users.map(
        (el, idx: number) => {
          return {
            id: idx.toString(),
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
      registerSpotlightActions(searchResult);
    }
  }, [searchUserByEmail.isSuccess, searchUserByEmail.data]);
  // debounce searching
  const handleTextSearch: DebouncedFunc<(query: string) => void> = debounce(
    (query) => {
      searchUserByEmail.mutate({
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
        {adminListQuery?.data?.users.map((item) => (
          <UserInfo
            key={item.id}
            id={item.id}
            name={item.name}
            title={item.role}
            email={item.email}
            userstatus={item.userStatus}
            sessionUserRole={userrole}
          />
        ))}
      </SimpleGrid>
      <Space h="lg" />
      <Userinfolist students={studentListQuery?.data} userrole={userrole} />

      <Center my="md">
        <Pagination
          total={totalPages}
          color="orange"
          page={pageNos}
          onChange={setpageNos}
        />
      </Center>
    </Container>
  );
};

export default UserPage;

function InviteUserModal({ openInviteUserModal, setopenInviteUserModal }: any) {
  const inviteUserMutation = trpc.user["inviteUser"].useMutation();

  const trpcContext = trpc.useContext();

  useEffect(() => {
    trpcContext.user["getUserList"].invalidate();
  }, [inviteUserMutation.isSuccess]);

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
): Promise<GetServerSidePropsResult<IUserProps>> => {
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
      userrole: session.user.role,
    },
  };
};
