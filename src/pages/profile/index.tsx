import {
  Avatar,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Role, UserStatus } from "@prisma/client";
import { GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MyNotice from "../../../components/dashboard/MyNotice";
import NoticeDetailModal from "../../../components/NoticeDetailModal";
import { trpc } from "../../utils/trpc";
import { authOptions } from "../api/auth/[...nextauth]";

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
  const [noticeId, setnoticeId] = useState<string>("");
  const [baseProfile, setBasicProfile] = useState<ProfileFields[]>([]);
  const [studentProfile, setStudentProfile] = useState<ProfileFields[]>([]);
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const router = useRouter();

  const userDetailsQuery = trpc.useQuery(["user.get-user-profile-details"], {
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
  });

  const clientSession = useSession();

  useEffect(() => {
    if (clientSession.status == "loading") return;
    if (clientSession.status == "unauthenticated") router.push("/auth/login");
  }, [router, clientSession.status]);

  if (userDetailsQuery.status == "loading")
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <Container>
      <Title my="md" order={3}>
        Your profile
      </Title>
      <Divider mt="sm" mb="xl" />
      <Group spacing="sm">
        <Avatar src={"https://picsum.photos/200"} size={200} radius="md" />
        <Container>
          <SimpleGrid cols={2} mb="sm">
            {baseProfile.map((field, id) => (
              <div key={id}>
                <Text size="lg" weight={900}>
                  {field.fieldName}
                </Text>
                <Text color="dimmed">{field.fieldValue}</Text>
              </div>
            ))}
          </SimpleGrid>

          <Button onClick={() => router.push("/profile/edit")} fullWidth>
            Edit Profile
          </Button>
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
      <MyNotice
        userrole={userrole}
        useremail={useremail}
        setnoticeId={setnoticeId}
        setOpenNoticeDialog={setOpenNoticeDialog}
      />
      <Space h="xl" />
    </Container>
  );
};

export default Profile;

export const getServerSideProps = async (
  context: any
): Promise<GetServerSidePropsResult<IPropsOnboard>> => {
  let session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
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
