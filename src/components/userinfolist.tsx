import {
  Badge,
  Button,
  createStyles,
  Group,
  Menu,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Role } from "@prisma/client";
import { IconAward, IconUserOff } from "@tabler/icons";
import Avatar from "boring-avatars";
import { useEffect } from "react";
import { UserListOutput } from "../schema/user.schema";
import { trpc } from "../utils/trpc";

interface IPropsUserinfoList {
  students: UserListOutput | undefined;
  userrole: Role;
}

function Userinfolist({ students, userrole }: IPropsUserinfoList): JSX.Element {
  const userInfoListStyle = useUserinfoListStyle();

  const rows = students?.users.map((item) => (
    <tr key={item.id}>
      <td>
        <Group spacing="sm">
          <Avatar
            size={40}
            name={item.email}
            variant="beam"
            colors={["#FC284F", "#FF824A", "#FEA887", "#F6E7F7", "#D1D0D7"]}
          />
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
  const trpcContext = trpc.useContext();

  const deleteUserMutation = trpc.user.deleteUser.useMutation({
    onSuccess: (data) => {
      trpcContext.user.getUserList.invalidate();

      return showNotification({
        title: "User Deleted",
        message: `${data.email} deleted successfully`,
      });
    },
    onError: (error) => {
      trpcContext.user.getUserList.invalidate();
      return showNotification({
        title: error.message,
        message: error.message,
      });
    },
  });
  const changeUserRoleMutation = trpc.user.changeUserRole.useMutation({
    onSuccess: (data) => {
      trpcContext.user.getUserList.invalidate();
      return showNotification({
        title: "User Role Changed",
        message: `${data.email} role successfully changed to ${data.role}`,
      });
    },
    onError: (error) => {
      trpcContext.user.getUserList.invalidate();
      return showNotification({
        title: error.message,
        message: error.message,
      });
    },
  });

  useEffect(() => {
    trpcContext.user.getUserList.invalidate();
  }, [deleteUserMutation.isSuccess, changeUserRoleMutation.isSuccess]);

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
