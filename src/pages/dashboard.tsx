import {
  Badge,
  Center,
  Container,
  createStyles,
  Divider,
  Pagination,
  ScrollArea,
  Space,
  Table,
  Text,
} from "@mantine/core";
import { Role, UserStatus } from "@prisma/client";
import { GetStaticPropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateNotice from "../../components/CreateNotice";
import NoticeDetailModal from "../../components/NoticeDetailModal";
import { useBackendApiContext } from "../../context/backend.api";
import { GetNoticeListOutput } from "../schema/notice.schema";
import { authOptions } from "./api/auth/[...nextauth]";

interface IPropsDashboard {
  username: string | null;
  useremail: string | null;
  userstatus: UserStatus;
  userrole: Role;
}

const Dashboard: NextPage<IPropsDashboard> = ({
  username,
  userstatus,
  userrole,
}) => {
  const noticeListStyle = useNoticeListStyle();
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const [noticeId, setnoticeId] = useState<string>("");
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [fetchedNotice, setfetchedNotice] = useState<GetNoticeListOutput>();
  const isAdmin = userrole == "ADMIN";
  const router = useRouter();
  const backend = useBackendApiContext();
  const userInfoListStyle = useNoticeListStyle();

  useEffect(() => {
    if (userstatus === "INVITED") router.push("/onboard");
  }, [router, userstatus]);

  const publishedNoticeQueryData = backend?.publishedNoticeQuery(pageNos);

  useEffect(() => {
    if (publishedNoticeQueryData) {
      setfetchedNotice(publishedNoticeQueryData.data);
    }
  }, [publishedNoticeQueryData]);

  useEffect(() => {
    const noticeNos: number = fetchedNotice?.totalNotice!;
    let pages = Math.ceil(noticeNos / 10);
    if (pages == 0) pages += 1;
    settotalPages(pages);
  }, [fetchedNotice, totalPages]);

  return (
    <Container>
      <Text weight="bolder" size={30} py="lg">
        Welcome, {username}
      </Text>
      {isAdmin ? <CreateNotice /> : <></>}

      {/* Add search bar for notice remove divider*/}
      <Divider my="xl" variant="solid" />

      {noticeId === "" ? (
        <></>
      ) : (
        <NoticeDetailModal
          noticeId={noticeId}
          openNoticeDialog={openNoticeDialog}
          setOpenNoticeDialog={setOpenNoticeDialog}
        />
      )}

      <ScrollArea classNames={userInfoListStyle.classes}>
        <Table
          sx={{ minWidth: 800 }}
          verticalSpacing="sm"
          highlightOnHover
          horizontalSpacing="xl"
          withBorder
        >
          <thead>
            <tr>
              <th style={{ width: "99%" }}>Notice Title</th>
              <th>Publisher</th>
            </tr>
          </thead>
          <tbody>
            {fetchedNotice?.notices &&
              fetchedNotice?.notices.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    setnoticeId(item.id);
                    setOpenNoticeDialog(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <Text size="sm" weight="bolder">
                      {item.title}
                    </Text>
                    {item.tags.map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        color={"orange"}
                        mr={4}
                      >
                        {item}
                      </Badge>
                    ))}
                  </td>

                  <td>
                    <Text size="xs" weight={"bolder"}>
                      {item.admin}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {item.updatedAt.toDateString()}
                    </Text>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ScrollArea>
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
  viewport: {
    minHeight: 600,
  },
}));

export const getServerSideProps = async (
  context: any
): Promise<GetStaticPropsResult<IPropsDashboard>> => {
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
