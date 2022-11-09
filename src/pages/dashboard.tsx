import {
  Badge,
  Box,
  Center,
  Container,
  createStyles,
  Group,
  Pagination,
  ScrollArea,
  Space,
  Table,
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
import { IconNotebook, IconSearch } from "@tabler/icons";
import { debounce, DebouncedFunc } from "lodash";

import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateNotice from "../../components/CreateNotice";
import NoticeDetailModal from "../../components/NoticeDetailModal";
import { useBackendApiContext } from "../../context/backend.api";
import { GetNoticeListOutput } from "../schema/notice.schema";
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
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [fetchedNotice, setfetchedNotice] = useState<GetNoticeListOutput>({
    totalNotice: 0,
    notices: [],
  });
  const searchedNotice: SpotlightAction[] = [];
  const isAdmin = userrole == "ADMIN";
  const router = useRouter();
  const backend = useBackendApiContext();
  const userInfoListStyle = useNoticeListStyle();

  useEffect(() => {
    if (userstatus === "INVITED") router.push("/onboard");
  }, [router, userstatus]);

  const publishedNoticeQueryData = backend?.publishedNoticeQuery(pageNos);
  const searchNoticeQueryMutation = trpc.useMutation(
    "notice.search-notice-by-title"
  );

  useEffect(() => {
    console.log("SETTING QUERY DATA");
    if (publishedNoticeQueryData?.isSuccess) {
      setfetchedNotice(publishedNoticeQueryData?.data!);
    }
  }, [
    publishedNoticeQueryData?.isLoading,
    publishedNoticeQueryData?.isSuccess,
  ]);

  const clientSession = useSession();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/login");
  }, [router, clientSession.status]);

  // for searching
  useEffect(() => {
    if (searchNoticeQueryMutation.isSuccess) {
      const search: SpotlightAction[] =
        searchNoticeQueryMutation.data.notices.map((el) => {
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
  }, [searchNoticeQueryMutation.isSuccess]);
  // debounce searching
  const handleTextSearch: DebouncedFunc<(query: string) => void> = debounce(
    (query) => {
      searchNoticeQueryMutation.mutate({
        searchText: query,
      });
    },
    800,
    { trailing: true, leading: false }
  );

  // for setting total page numbers of pagination component
  useEffect(() => {
    const noticeNos: number = fetchedNotice?.totalNotice!;
    let pages = Math.ceil(noticeNos / 10);
    if (pages == 0) pages += 1;
    settotalPages(pages);
  }, [fetchedNotice, totalPages]);

  return (
    <Container>
      <Box py="lg">
        <Text weight="bolder" size={25}>
          Welcome, {username}
        </Text>
        <Text size={"xs"} color="dimmed">
          {useremail}
        </Text>
      </Box>

      {isAdmin ? <CreateNotice /> : <></>}

      {noticeId === "" ? (
        <></>
      ) : (
        <NoticeDetailModal
          noticeId={noticeId}
          openNoticeDialog={openNoticeDialog}
          setOpenNoticeDialog={setOpenNoticeDialog}
        />
      )}

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

      <ScrollArea classNames={userInfoListStyle.classes}>
        <Table
          sx={{ minWidth: 800 }}
          verticalSpacing="sm"
          highlightOnHover
          horizontalSpacing="xl"
          withBorder
        >
          <thead>
            <tr>
              <th style={{ width: "99%" }}>Notice Title</th>
              <th>Publisher</th>
            </tr>
          </thead>
          <tbody>
            {fetchedNotice?.notices.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  setnoticeId(item.id);
                  setOpenNoticeDialog(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <Text size="sm" weight="bolder">
                    {item.title}
                  </Text>
                  {item.tags?.map((item, idx) => (
                    <Badge key={idx} variant="outline" color={"orange"} mr={4}>
                      {item}
                    </Badge>
                  ))}
                </td>

                <td>
                  <Text size="xs" weight={"bolder"}>
                    {item.admin}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {item.updatedAt.toDateString()}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      <Space h="md" />
      <Center>
        <Pagination
          total={totalPages}
          color="orange"
          page={pageNos}
          onChange={setpageNos}
        />
      </Center>
    </Container>
  );
};;;;;;;;;;;;;;;;;;;

export default Dashboard;

const useNoticeListStyle = createStyles((_theme, _params, getRef) => ({
  viewport: {
    minHeight: 600,
  },
}));

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
