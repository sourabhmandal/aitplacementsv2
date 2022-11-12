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
  Pagination,
  ScrollArea,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Role, UserStatus } from "@prisma/client";
import { IconNotes, IconNotesOff, IconTrashX } from "@tabler/icons";
import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoticeDetailModal from "../../components/NoticeDetailModal";
import { useBackendApiContext } from "../../context/backend.api";
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
const Profile: NextPage<IPropsOnboard> = ({
  useremail,
  userstatus,
  userrole,
}) => {
  const [baseProfile, setBasicProfile] = useState<ProfileFields[]>([]);
  const [studentProfile, setStudentProfile] = useState<ProfileFields[]>([]);
  const userInfoListStyle = useNoticeListStyle();
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const backend = useBackendApiContext();

  const userDetailsQuery = trpc.useQuery(
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

        if (data?.studentDetails) {
          const { studentDetails } = data;
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

  const userNoticesQuery = trpc.useQuery(
    ["notice.my-notices", { email: useremail!, pageNos: pageNos }],
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
      onSuccess(data) {
        let pages = Math.ceil(data?.count / 10);
        if (pages == 0) pages += 1;
        settotalPages(pages);
      },
    }
  );

  const clientSession = useSession();
  const router = useRouter();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/login");
  }, [router, clientSession.status]);

  useEffect(() => {
    userNoticesQuery.refetch();
  }, [
    backend?.changeNoticeStatusMutation.isSuccess,
    backend?.deleteNoticeMutation.isSuccess,
  ]);

  if (userDetailsQuery.status == "loading")
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
      {noticeId === "" ? (
        <></>
      ) : (
        <NoticeDetailModal
          noticeId={noticeId}
          openNoticeDialog={openNoticeDialog}
          setOpenNoticeDialog={setOpenNoticeDialog}
        />
      )}
      {userrole == "ADMIN" ? (
        <>
          <ScrollArea classNames={userInfoListStyle.classes}>
            <Table
              sx={{ minWidth: 800 }}
              horizontalSpacing="lg"
              verticalSpacing="sm"
              highlightOnHover
            >
              <thead>
                <tr>
                  <th style={{ width: "99%" }}>Notice Title</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userNoticesQuery.data?.notice.map((item, idx: number) => (
                  <tr key={idx} style={{ cursor: "pointer" }}>
                    <td
                      onClick={() => {
                        setnoticeId(item.id);
                        setOpenNoticeDialog(true);
                      }}
                    >
                      <Text size="sm" weight="bolder">
                        {item.title}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {item.updatedAt.toDateString()}
                      </Text>
                    </td>

                    <td
                      onClick={() => {
                        setnoticeId(item.id);
                        setOpenNoticeDialog(true);
                      }}
                      style={{ textAlign: "center" }}
                    >
                      <Badge
                        variant="outline"
                        color={item.isPublished ? "orange" : "violet"}
                      >
                        {item.isPublished ? "Published" : "Drafted"}
                      </Badge>
                    </td>

                    <td align="right">
                      <UserListInfoActionMenu
                        userrole={userrole}
                        isPublished={item.isPublished || false}
                        noticeId={item.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
          <Center>
            <Pagination
              total={totalPages}
              color="orange"
              page={pageNos}
              onChange={setpageNos}
            />
          </Center>
        </>
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Profile;

function UserListInfoActionMenu({
  userrole,
  isPublished,
  noticeId,
}: {
  userrole: Role;
  isPublished: boolean;
  noticeId: string;
}) {
  const backend = useBackendApiContext();
  const updateNoticeStatus = (isPublished: boolean, noticeId: string) => {
    backend?.changeNoticeStatusMutation.mutate({
      isPublished: isPublished,
      noticeId: noticeId,
    });
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button disabled={userrole !== "ADMIN"}>Action Menu</Button>
      </Menu.Target>

      <Menu.Dropdown>
        {userrole === "ADMIN" ? (
          <>
            <Menu.Label>Update Notice</Menu.Label>
            {isPublished ? (
              <Menu.Item
                icon={<IconNotesOff size={14} />}
                onClick={() => updateNoticeStatus(false, noticeId)}
              >
                Change to Drafted
              </Menu.Item>
            ) : (
              <Menu.Item
                icon={<IconNotes size={14} />}
                onClick={() => updateNoticeStatus(true, noticeId)}
              >
                Change to Published
              </Menu.Item>
            )}

            <Menu.Divider />
            <Menu.Label>Danger zone</Menu.Label>
            <Menu.Item
              color="red"
              icon={<IconTrashX size={14} />}
              onClick={() =>
                backend?.deleteNoticeMutation.mutate({ noticeId: noticeId })
              }
            >
              Delete Notice
            </Menu.Item>
          </>
        ) : (
          <></>
        )}
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
