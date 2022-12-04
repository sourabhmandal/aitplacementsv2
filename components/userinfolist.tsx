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
import { Role } from "@prisma/client";
import { IconAward, IconUserOff } from "@tabler/icons";
import { UserListOutput } from "../src/schema/user.schema";
import { trpc } from "../src/utils/trpc";

interface IPropsUserinfoList {
  students: UserListOutput | undefined;
  userrole: Role;
}

function Userinfolist({ students, userrole }: IPropsUserinfoList): JSX.Element {
  const userInfoListStyle = useUserinfoListStyle();

  const rows = students?.map((item) => (
    <tr key={item.id}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={"https://picsum.photos/200"} radius={40} />
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
        <UserListInfoActionMenu sessionUserRole={userrole} id={item.id} />
      </td>
    </tr>
  ));

  return (
    <ScrollArea classNames={userInfoListStyle.classes}>
      <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: "99%" }}>User</th>
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

function UserListInfoActionMenu({
  sessionUserRole,
  id,
}: {
  sessionUserRole: Role;
  id: string;
}) {
  const deleteUserMutation = trpc.useMutation("user.delete-user");
  const changeUserRoleMutation = trpc.useMutation("user.change-user-role");
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          disabled={
            deleteUserMutation.isLoading ||
            changeUserRoleMutation.isLoading ||
            sessionUserRole == "STUDENT"
          }
        >
          Action Menu
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Change Role</Menu.Label>
        {sessionUserRole == "ADMIN" ? (
          <Menu.Item
            icon={<IconAward size={14} />}
            onClick={() =>
              changeUserRoleMutation.mutate({
                id: id,
                role: "ADMIN",
              })
            }
          >
            Make Admin
          </Menu.Item>
        ) : (
          <></>
        )}

        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        {sessionUserRole == "ADMIN" ? (
          <>
            <Menu.Item
              onClick={() => deleteUserMutation.mutate({ id: id })}
              color="red"
              icon={<IconUserOff size={14} />}
            >
              Remove User
            </Menu.Item>
          </>
        ) : (
          <></>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

const useUserinfoListStyle = createStyles((theme) => ({
  viewport: {
    minHeight: 600,
  },
}));