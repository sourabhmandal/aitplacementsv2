import {
  Avatar,
  Badge,
  Button,
  createStyles,
  Group,
  Menu,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { IconAward, IconUserOff, IconUsers } from "@tabler/icons";
import { UsersTableProps } from "../src/pages/users";

function Userinfolist({
  students,
}: {
  students: UsersTableProps[];
}): JSX.Element {
  const userInfoListStyle = useUserinfoListStyle();

  const rows = students.map((item: UsersTableProps) => (
    <tr key={item.name}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={item.avatar} radius={40} />
          <div>
            <Text size="sm" weight={500}>
              {item.name}
            </Text>
            <Text size="xs" color="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        <Badge color="violet" variant="outline" fullWidth>
          {item.userStatus}
        </Badge>
      </td>

      <td>
        <Text
          size="xs"
          weight="bolder"
          align="center"
          color={item.role === "STUDENT" ? "orange" : "violet"}
        >
          {item.role}
        </Text>
      </td>
      <td style={{ textAlign: "right" }}>
        <UserListInfoActionMenu />
      </td>
    </tr>
  ));

  return (
    <ScrollArea classNames={userInfoListStyle.classes}>
      <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
        <thead>
          <tr>
            <th>User</th>
            <th style={{ textAlign: "center" }}>Status</th>
            <th style={{ textAlign: "center" }}>Role</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default Userinfolist;

function UserListInfoActionMenu() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>Action Menu</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Change Role</Menu.Label>
        <Menu.Item icon={<IconAward size={14} />}>Make Admin</Menu.Item>
        <Menu.Item icon={<IconUsers size={14} />}>Make Student</Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item color="red" icon={<IconUserOff size={14} />}>
          Remove User
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const useUserinfoListStyle = createStyles((theme) => ({
  viewport: {
    minHeight: 600,
  },
}));