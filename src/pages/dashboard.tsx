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
import { showNotification } from "@mantine/notifications";
import {
  SpotlightAction,
  SpotlightProvider,
  openSpotlight,
  registerSpotlightActions,
} from "@mantine/spotlight";

import { Role, UserStatus } from "@prisma/client";
import {
  IconClipboard,
  IconMailbox,
  IconNotebook,
  IconSearch,
} from "@tabler/icons";
import { DebouncedFunc, debounce } from "lodash";

import { GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoticeDetailModal from "../components/NoticeDetailModal";
import MyNotice from "../components/dashboard/MyNotice";
import PublishedNotices from "../components/dashboard/PublishedNotices";
import { trpc } from "../utils/trpc";
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
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);

  useEffect(() => {
    if (userstatus === "INACTIVE") {
      showNotification({
        message: "Your account have been deactivated, please contact admin",
        title: "Account Inactive",
      });
    } else if (userstatus === "INVITED") router.push("/onboard");
  }, [router, userstatus]);
  const clientSession = useSession();

  const getUserProfile = trpc.user.getUserProfileDetails.useQuery();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/auth/login");
  }, [router, clientSession.status]);

  const searchNoticeByTitle = trpc.notice.searchNoticeByTitle.useMutation({
    onError: (e) => {
      showNotification({
        title: e.message,
        message: e.message,
      });
    },
  });

  // for searching
  useEffect(() => {
    if (searchNoticeByTitle.isSuccess) {
      const search: SpotlightAction[] = searchNoticeByTitle.data.notices.map(
        (el: any) => {
          return {
            title: el.title,
            icon: <IconNotebook />,
            onTrigger: () => {
              setnoticeId(el.id);
              setOpenNoticeDialog(true);
            },
            keywords: el.tags,
          };
        }
      );
      registerSpotlightActions(search);
    }
  }, [searchNoticeByTitle.isSuccess, searchNoticeByTitle?.data?.notices]);
  // debounce searching
  const handleTextSearch: DebouncedFunc<(query: string) => void> = debounce(
    (query) => {
      searchNoticeByTitle.mutate({
        searchText: query,
      });
    },
    800,
    { trailing: true, leading: false }
  );

  return userstatus === "ACTIVE" ? (
    <>
      <Head>
        <title>AIT Placements</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
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
            Welcome, {getUserProfile.data?.name || username}
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
    </>
  ) : (
    <>
      <Head>
        <title>AIT Placements</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Stack
        justify="center"
        align="center"
        style={{ height: "100%", textAlign: "center" }}
      >
        <Text>you are not onboarded yet, please complete your profile</Text>
        <Link href="/onboard">Register yourself</Link>
      </Stack>
    </>
  );
};

export default Dashboard;

export const getServerSideProps = async (
  context: any
): Promise<GetServerSidePropsResult<IPropsDashboard>> => {
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
      userstatus: session.user?.userStatus || null,
      userrole: session.user?.role || null,
    },
  };
};
