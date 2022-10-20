import {
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  createStyles,
  Divider,
  Group,
  Loader,
  Menu,
  ScrollArea,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Role, UserStatus } from "@prisma/client";
import { IconEdit, IconTrashX } from "@tabler/icons";
import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";

interface IPropsOnboard {
  username: string | null;
  useremail: string | null;
  userstatus: UserStatus;
  userrole: Role;
}

type ProfileFields = {
  fieldName: string;
  fieldValue: string;
};
type NoticeFields = {
  title: string;
  isPublished: boolean;
  updatedAt: Date;
};

const Profile: NextPage<IPropsOnboard> = ({
  useremail,
  userstatus,
  userrole,
}) => {
  const [baseProfile, setBasicProfile] = useState<ProfileFields[]>([]);
  const [studentProfile, setStudentProfile] = useState<ProfileFields[]>([]);
  const userInfoListStyle = useNoticeListStyle();

  const userDetails = trpc.useQuery(
    ["user.get-user-details", { email: useremail! }],
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
      onSuccess(data) {
        setBasicProfile([
          { fieldName: "Full Name", fieldValue: data.name },
          { fieldName: "Email", fieldValue: data.email },
          { fieldName: "Phone No.", fieldValue: data.phoneNo },
          { fieldName: "Role", fieldValue: data.role },
        ]);

        if (userDetails.data?.adminDetails) {
          const { adminDetails } = userDetails.data;
        } else if (userDetails.data?.studentDetails) {
          const { studentDetails } = userDetails.data;
          setStudentProfile([
            { fieldName: "Branch", fieldValue: studentDetails.branch },
            {
              fieldName: "Student Registration Number",
              fieldValue: studentDetails.registrationNumber.toString(),
            },
            {
              fieldName: "Year of Study",
              fieldValue: studentDetails.year.toString(),
            },
          ]);
        }
      },
    }
  );

  if (userDetails.status == "loading")
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <Container>
      <Title order={3}>Your profile</Title>
      <Divider mt="sm" mb="xl" />
      <Group spacing="sm">
        <Avatar src={"https://picsum.photos/200"} size={200} radius="md" />
        <Container>
          <SimpleGrid cols={2}>
            {baseProfile.map((field, id) => (
              <div key={id}>
                <Text size="lg" weight={900}>
                  {field.fieldName}
                </Text>
                <Text color="dimmed">{field.fieldValue}</Text>
              </div>
            ))}
          </SimpleGrid>
        </Container>
      </Group>
      <Divider my="lg" mb="xl" />
      <SimpleGrid cols={2}>
        {studentProfile.map((field, id) => (
          <div key={id}>
            <Text size="lg" weight={900}>
              {field.fieldName}
            </Text>
            <Text color="dimmed">{field.fieldValue}</Text>
          </div>
        ))}
      </SimpleGrid>
      <ScrollArea classNames={userInfoListStyle.classes}>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
          <thead>
            <tr>
              <th>Notice Title</th>
              <th style={{ textAlign: "center" }}>Publish Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {userDetails.data?.adminDetails &&
              userDetails.data?.adminDetails?.notices.map(
                (item: NoticeFields, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <Text size="sm" weight={500}>
                        {item.title}
                      </Text>
                      <Text size="xs" weight="bolder">
                        {item.updatedAt.toDateString()}
                      </Text>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <Badge
                        variant="outline"
                        color={item.isPublished ? "orange" : "violet"}
                      >
                        {item.isPublished ? "Published" : "Not Published"}
                      </Badge>
                    </td>

                    <td align="right">
                      <UserListInfoActionMenu />
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
};

export default Profile;

function UserListInfoActionMenu() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>Action Menu</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Update Notice</Menu.Label>
        <Menu.Item icon={<IconEdit size={14} />}>Update Notice</Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item color="red" icon={<IconTrashX size={14} />}>
          Delete Notice
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const useNoticeListStyle = createStyles((theme) => ({
  viewport: {
    minHeight: 600,
  },
}));

export const getServerSideProps = async (
  context: any
): Promise<GetStaticPropsResult<IPropsOnboard>> => {
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
