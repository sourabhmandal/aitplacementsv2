import { Button, createStyles, Group, Stack, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Role } from "@prisma/client";
import { IconAt, IconStatusChange } from "@tabler/icons";
import Avatar from "boring-avatars";
import { trpc } from "../src/utils/trpc";

interface UserInfoIconsProps {
  id: string;
  name: string;
  title: string;
  userstatus: string;
  email: string;
  sessionUserRole: Role;
}

export function UserInfo({
  name,
  title,

  userstatus,
  email,
  sessionUserRole,
  id,
}: UserInfoIconsProps): JSX.Element {
  const { classes } = useStyles();
  const trpcContext = trpc.useContext();

  const deleteUserMutation = trpc.useMutation("user.delete-user", {
    onSuccess: (data) => {
      trpcContext.invalidateQueries("user.get-user-list");
      return showNotification({
        title: "User Deleted",
        message: `${data.email} deleted successfully`,
      });
    },
    onError: (error) => {
      trpcContext.invalidateQueries("user.get-user-list");
      return showNotification({
        title: error.data?.code,
        message: error.message,
      });
    },
  });
  const changeUserRoleMutation = trpc.useMutation("user.change-user-role", {
    onSuccess: (data) => {
      trpcContext.invalidateQueries("user.get-user-list");
      return showNotification({
        title: "User Role Changed",
        message: `${data.email} role successfully changed to ${data.role}`,
      });
    },
    onError: (error) => {
      trpcContext.invalidateQueries("user.get-user-list");
      return showNotification({
        title: error.data?.code,
        message: error.message,
      });
    },
  });

  const openModal = (email: string) =>
    openConfirmModal({
      title: `Do you wish to make ${email} as STUDENT USER?`,
      children: (
        <Text size="sm">Please click one of these buttons to proceed.</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () =>
        changeUserRoleMutation.mutate({
          id: id,
          role: "STUDENT",
        }),
    });

  return (
    <Group>
      <Avatar
        size={120}
        name={email}
        variant="beam"
        square
        colors={["#FC284F", "#FF824A", "#FEA887", "#F6E7F7", "#D1D0D7"]}
      />
      <Stack spacing={0}>
        <Text
          size="xs"
          sx={{ textTransform: "uppercase" }}
          weight={700}
          color="dimmed"
        >
          {title}
        </Text>

        <Text size="lg" weight={500} className={classes.name}>
          {name}
        </Text>

        <Group noWrap spacing={10} mt={3}>
          <IconAt stroke={1.5} size={16} className={classes.icon} />
          <Text size="xs" color="dimmed">
            {email}
          </Text>
        </Group>
        <Group>
          <IconStatusChange stroke={1.5} size={16} className={classes.icon} />
          <Group align="baseline">
            <Text
              size="xs"
              weight="bolder"
              color={userstatus == "ACTIVE" ? "orange" : "violet"}
            >
              {userstatus}
            </Text>

            {sessionUserRole === "ADMIN" ? (
              <Button
                compact
                size="xs"
                mt={4}
                disabled={
                  deleteUserMutation.isLoading ||
                  changeUserRoleMutation.isLoading ||
                  sessionUserRole !== "ADMIN"
                }
                onClick={() => openModal(email)}
              >
                Make Student
              </Button>
            ) : (
              <></>
            )}
          </Group>
        </Group>
      </Stack>
    </Group>
  );
}

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));
