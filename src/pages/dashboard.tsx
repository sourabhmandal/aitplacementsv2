import {
  Badge,
  Center,
  Container,
  createStyles,
  Divider,
  Group,
  List,
  Pagination,
  Space,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCircleCheck } from "@tabler/icons";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateNotice from "../../components/CreateNotice";
import NoticeDetailModal from "../../components/NoticeDetailModal";
import { trpc } from "../utils/trpc";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const noticeListStyle = useNoticeListStyle();
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);

  const publishedNoticeQuery = trpc.useQuery(
    ["notice.published-notice-list", { pageNos }],
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
      onSuccess(data) {
        console.log(`notice loaded for page nos. ${pageNos}`);
        console.log(data);
      },
    }
  );

  useEffect(() => {
    const noticeNos: number = publishedNoticeQuery.data?.totalNotice!;
    let pages = Math.ceil(noticeNos / 10);
    if (pages == 0) pages += 1;
    settotalPages(pages);
  }, [publishedNoticeQuery, totalPages]);

  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
      router.push("/login");
    },
  });

  if (status === "loading") {
    return <p>Loading Skeleton...</p>;
  }
  return (
    <Container>
      <Text weight="bolder" size={30} py="lg">
        Welcome, {data.user?.name}
      </Text>
      <CreateNotice />
      <Divider my="xl" variant="solid" />

      <List
        classNames={noticeListStyle.classes}
        spacing="xs"
        size="lg"
        center
        listStyleType="none"
      >
        {noticeId === "" ? (
          <></>
        ) : (
          <NoticeDetailModal
            noticeId={noticeId}
            openNoticeDialog={openNoticeDialog}
            setOpenNoticeDialog={setOpenNoticeDialog}
          />
        )}
        {publishedNoticeQuery.data?.notices.map((el, idx) => {
          return (
            <List.Item
              onClick={() => {
                setnoticeId(el.id);
                setOpenNoticeDialog(true);
                console.log(el.id);
              }}
              key={idx}
            >
              <Group spacing="xs">
                <ThemeIcon color="teal" size={16} radius="xl">
                  <IconCircleCheck size={10} />
                </ThemeIcon>
                <Text size="xs" color="dimmed" weight="bold">
                  {el.updatedAt.toDateString()}
                </Text>
              </Group>

              <Text py="xs">{el.title}</Text>

              <Group spacing={5} align="left" classNames={noticeListStyle}>
                {el.tags.map((tag, idx) => (
                  <Badge key={idx}>{tag}</Badge>
                ))}
              </Group>
            </List.Item>
          );
        })}
      </List>
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
};

export default Dashboard;

const useNoticeListStyle = createStyles((_theme, _params, getRef) => ({
  root: {},
  item: {
    transition: "width 250ms ease",
    padding: 12,
    cursor: "pointer",

    "&:hover": {
      background:
        _theme.colorScheme === "dark"
          ? _theme.colors.dark[3]
          : _theme.colors.orange[1],
      borderRadius: "0.3em",
      boxShadow:
        "rgb(0 0 0 / 5%) 0px 1px 3px, rgb(0 0 0 / 5%) 0px 10px 15px -5px, rgb(0 0 0 / 4%) 0px 7px 7px -5px",
    },
  },
}));
