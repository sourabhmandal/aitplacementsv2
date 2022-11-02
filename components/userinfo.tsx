import { Avatar, Button, createStyles, Group, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Role } from "@prisma/client";
import { IconAt, IconPhoneCall } from "@tabler/icons";
import { useBackendApiContext } from "../context/backend.api";

interface UserInfoIconsProps {
  id: string;
  avatar: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  sessionUserRole: Role;
}

export function UserInfo({
  avatar,
  name,
  title,
  phone,
  email,
  sessionUserRole,
  id,
}: UserInfoIconsProps): JSX.Element {
  const { classes } = useStyles();
  const backend = useBackendApiContext();

  const openModal = (email: string) =>
    openConfirmModal({
      title: `Do you wish to make ${email} as STUDENT USER?`,
      children: (
        <Text size="sm">Please click one of these buttons to proceed.</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () =>
        backend?.changeUserRoleMutation.mutate({
          id: id,
          role: "STUDENT",
        }),
    });

  return (
    <Group noWrap>
      <Avatar src={avatar} size={94} radius="md" />
      <div>
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

        <Group noWrap spacing={10} mt={5}>
          <IconPhoneCall stroke={1.5} size={16} className={classes.icon} />
          <Text size="xs" color="dimmed">
            {phone}
          </Text>
        </Group>
        {sessionUserRole === "ADMIN" ? (
          <Button compact size="xs" mt={4} onClick={() => openModal(email)}>
            Make Student
          </Button>
        ) : (
          <></>
        )}
      </div>
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
