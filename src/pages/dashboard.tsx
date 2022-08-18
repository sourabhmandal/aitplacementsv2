import {
  Badge,
  Container,
  createStyles,
  Divider,
  Group,
  List,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCircleCheck, IconCircleDashed } from "@tabler/icons";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import CreateNotice from "../../components/CreateNotice";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const noticeListStyle = useNoticeListStyle();

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
        <List.Item
          onClick={() => {
            alert("hello");
          }}
        >
          <Group spacing="xs">
            <ThemeIcon color="teal" size={16} radius="xl">
              <IconCircleCheck size={10} />
            </ThemeIcon>
            <Text size="xs" color="dimmed" weight="bold">
              {new Date().toDateString()}
            </Text>
          </Group>

          <Text py="xs">Clone or download repository from GitHub</Text>

          <Group spacing={5} align="left" classNames={noticeListStyle}>
            <Badge>Test badge</Badge>
            <Badge>Test badge</Badge>
            <Badge>Test badge</Badge>
          </Group>
        </List.Item>
        <List.Item
          onClick={() => {
            alert("hello");
          }}
        >
          <Group spacing="xs">
            <ThemeIcon color="blue" size={16} radius="xl">
              <IconCircleDashed size={10} />
            </ThemeIcon>
            <Text size="xs" color="dimmed" weight="bold">
              {new Date().toDateString()}
            </Text>
          </Group>

          <Text py="xs">Clone or download repository from GitHub</Text>

          <Group spacing={5} align="left" classNames={noticeListStyle}>
            <Badge>Test badge</Badge>
            <Badge>Test badge</Badge>
            <Badge>Test badge</Badge>
          </Group>
        </List.Item>
      </List>
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
