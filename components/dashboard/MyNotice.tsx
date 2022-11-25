import {
  ActionIcon,
  Badge,
  Center,
  createStyles,
  Group,
  Pagination,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { Role } from "@prisma/client";
import { IconNotes, IconNotesOff, IconPencil, IconTrashX } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useBackendApiContext } from "../../context/backend.api";
import { showCommingSoon } from "../../src/utils/constants";

function MyNotice({
  userrole,
  useremail,
  setnoticeId,
  setOpenNoticeDialog,
}: {
  userrole: Role;
  useremail: string | null;
  setnoticeId: any;
  setOpenNoticeDialog: any;
}) {
  const userInfoListStyle = useNoticeListStyle();
  const [pageNos, setpageNos] = useState(1);
  const [totalPages, settotalPages] = useState(1);
  const backend = useBackendApiContext();

  const userNoticesQuery = backend?.myNoticeQuery(useremail!, pageNos);

  useEffect(() => {
    if (userNoticesQuery?.isSuccess) {
      let pages = Math.ceil(userNoticesQuery?.data?.count! / 10);
      if (pages == 0) pages += 1;
      settotalPages(pages);
    }
  }, [userNoticesQuery?.isSuccess]);

  return userrole == "ADMIN" ? (
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
            {userNoticesQuery?.data?.notice.map((item, idx: number) => (
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
                <td>
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
        <Center my={10}>
          <Pagination
            total={totalPages}
            color="orange"
            page={pageNos}
            onChange={setpageNos}
          />
        </Center>
      </ScrollArea>
    </>
  ) : (
    <></>
  );
}

export default MyNotice;

const useNoticeListStyle = createStyles((theme) => ({
  viewport: {
    minHeight: 600,
  },
}));

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

  return userrole === "ADMIN" ? (
    <Group noWrap>
      {isPublished ? (
        <Tooltip label="Draft">
          <ActionIcon
            variant="outline"
            color="orange"
            onClick={() => updateNoticeStatus(false, noticeId)}
          >
            <IconNotesOff size={16} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Tooltip label="Publish">
          <ActionIcon
            variant="outline"
            color="indigo"
            onClick={() => updateNoticeStatus(true, noticeId)}
          >
            <IconNotes size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      <Tooltip label="Edit">
        <ActionIcon
          variant="outline"
          color="yellow"
          onClick={() => showCommingSoon()}
        >
          <IconPencil size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete">
        <ActionIcon
          variant="outline"
          color="red"
          onClick={() =>
            backend?.deleteNoticeMutation.mutate({ noticeId: noticeId })
          }
        >
          <IconTrashX size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  ) : (
    <></>
  );
}
