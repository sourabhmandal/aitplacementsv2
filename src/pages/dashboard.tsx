import {
  Box,
  Button,
  Container,
  Group,
  Space,
  Stack,
  Tabs,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  openSpotlight,
  registerSpotlightActions,
  SpotlightAction,
  SpotlightProvider,
} from "@mantine/spotlight";

import { Role, UserStatus } from "@prisma/client";
import {
  IconClipboard,
  IconMailbox,
  IconNotebook,
  IconSearch,
} from "@tabler/icons";
import { debounce, DebouncedFunc } from "lodash";

import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MyNotice from "../../components/dashboard/MyNotice";
import PublishedNotices from "../../components/dashboard/PublishedNotices";
import NoticeDetailModal from "../../components/NoticeDetailModal";
import { useBackendApiContext } from "../../context/backend.api";
import { authOptions } from "./api/auth/[...nextauth]";

interface IPropsDashboard {
  username: string | null;
  useremail: string | null;
  userstatus: UserStatus;
  userrole: Role;
}

const Dashboard: NextPage<IPropsDashboard> = ({
  username,
  userstatus,
  userrole,
  useremail,
}) => {
  const searchedNotice: SpotlightAction[] = [];
  const isAdmin = userrole == "ADMIN";
  const router = useRouter();
  const backend = useBackendApiContext();
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);

  useEffect(() => {
    if (userstatus === "INVITED") router.push("/onboard");
  }, [router, userstatus]);
  const clientSession = useSession();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/login");
  }, [router, clientSession.status]);

  // for searching
  useEffect(() => {
    if (backend?.searchNoticeByTitle.isSuccess) {
      const search: SpotlightAction[] =
        backend?.searchNoticeByTitle.data.notices.map((el) => {
          return {
            title: el.title,
            icon: <IconNotebook />,
            onTrigger: () => {
              setnoticeId(el.id);
              setOpenNoticeDialog(true);
            },
            keywords: el.tags,
          };
        });
      registerSpotlightActions(search);
    }
  }, [backend?.searchNoticeByTitle.isSuccess]);
  // debounce searching
  const handleTextSearch: DebouncedFunc<(query: string) => void> = debounce(
    (query) => {
      backend?.searchNoticeByTitle.mutate({
        searchText: query,
      });
    },
    800,
    { trailing: true, leading: false }
  );

  return userstatus === "ACTIVE" ? (
    <Container>
      {noticeId === "" ? (
        <></>
      ) : (
        <NoticeDetailModal
          noticeId={noticeId}
          openNoticeDialog={openNoticeDialog}
          setOpenNoticeDialog={setOpenNoticeDialog}
        />
      )}
      <Box py="lg">
        <Text weight="bolder" size={25}>
          Welcome, {username}
        </Text>
        <Text size={"xs"} color="dimmed">
          {useremail}
        </Text>
      </Box>
      {isAdmin ? (
        <Button fullWidth onClick={() => router.push(`/notice/`)}>
          Create a Notice
        </Button>
      ) : (
        <></>
      )}
      <Button
        fullWidth
        onClick={() => router.push(`https://anubhav.aitoss.club/`)}
        color="blue"
        variant="outline"
        my={16}
      >
        AIT Interview Experience
      </Button>
      <Space h="xl" />

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

      {userrole == "ADMIN" ? (
        <Tabs defaultValue="published">
          <Tabs.List>
            <Tabs.Tab value="published" icon={<IconClipboard size={14} />}>
              Published
            </Tabs.Tab>
            <Tabs.Tab value="drafted" icon={<IconMailbox size={14} />}>
              My Notices
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="published" pt="xs">
            <PublishedNotices
              setnoticeId={setnoticeId}
              setOpenNoticeDialog={setOpenNoticeDialog}
            />
          </Tabs.Panel>
          <Tabs.Panel value="drafted" pt="xs">
            <MyNotice
              userrole={userrole}
              useremail={useremail}
              setnoticeId={setnoticeId}
              setOpenNoticeDialog={setOpenNoticeDialog}
            />
          </Tabs.Panel>
        </Tabs>
      ) : (
        <PublishedNotices
          setnoticeId={setnoticeId}
          setOpenNoticeDialog={setOpenNoticeDialog}
        />
      )}
    </Container>
  ) : (
    <Stack
      justify="center"
      align="center"
      style={{ height: "100%", textAlign: "center" }}
    >
      <Text>you are not onboarded yet, please complete your profile</Text>
      <Link href="/onboard">Register yourself</Link>
    </Stack>
  );
};

export default Dashboard;

export const getServerSideProps = async (
  context: any
): Promise<GetStaticPropsResult<IPropsDashboard>> => {
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
