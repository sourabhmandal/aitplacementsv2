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
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Role } from "@prisma/client";
import {
  IconDots,
  IconNotes,
  IconNotesOff,
  IconPencil,
  IconTrashX,
} from "@tabler/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NoticeMetadata } from "../../schema/notice.schema";
import { trpc } from "../../utils/trpc";

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
  const trpcContext = trpc.useContext();

  const changeNoticeStatusMutation = trpc.notice.changeNoticeStatus.useMutation(
    {
      onError: (error) => {
        showNotification({
          message: error.message,
          title: error.data?.code,
        });
      },
    }
  );
  const deleteNoticeMutation = trpc.notice.deleteNotice.useMutation({
    onError: (error) => {
      showNotification({
        message: error.message,
        title: error.data?.code,
      });
    },
  });
  const userNoticesQuery = trpc.notice.myNotices.useQuery({ pageNos });
  const updateNoticeStatus = async (
    shouldPublish: boolean,
    noticeId: string
  ) => {
    await changeNoticeStatusMutation.mutate({
      isPublished: shouldPublish,
      noticeId: noticeId,
    });
  };

  useEffect(() => {
    trpcContext.notice.myNotices.invalidate();
    trpcContext.notice.publishedNoticeList.invalidate();
  }, [changeNoticeStatusMutation.isSuccess, deleteNoticeMutation.isSuccess]);

  useEffect(() => {
    if (userNoticesQuery?.isSuccess) {
      let pages = Math.ceil(userNoticesQuery?.data?.count! / 10);
      if (pages == 0) pages += 1;
      settotalPages(pages);
    }
  }, [
    userNoticesQuery?.isSuccess,
    userNoticesQuery?.data?.notice,
    userNoticesQuery?.data?.count,
    userNoticesQuery?.isFetched,
  ]);

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
            {userNoticesQuery.data?.notice.map(
              (item: NoticeMetadata, idx: number) => (
                <tr
                  key={item.id + idx.toString()}
                  style={{ cursor: "pointer" }}
                >
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
                      {item.updatedAt}
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
                    {userrole === "ADMIN" ? (
                      <Group noWrap>
                        <Tooltip
                          label={item.isPublished ? "Draft Now" : "Publish Now"}
                        >
                          <ActionIcon
                            variant="outline"
                            color={item.isPublished ? "orange" : "violet"}
                            disabled={changeNoticeStatusMutation.isLoading}
                            onClick={() =>
                              openConfirmModal({
                                title: `Do you want to make this article ${
                                  item.isPublished ? "drafted?" : "published?"
                                }`,
                                children: (
                                  <Text size="sm">
                                    This action is so important that you are
                                    required to confirm it with a modal. Please
                                    click one of these buttons to proceed.
                                  </Text>
                                ),

                                labels: {
                                  confirm: "Confirm",
                                  cancel: "Cancel",
                                },
                                onCancel: () => {},
                                onConfirm: async () =>
                                  await updateNoticeStatus(
                                    !item.isPublished,
                                    item.id
                                  ),

                                closeOnClickOutside: false,
                              })
                            }
                          >
                            {item.isPublished ? (
                              <IconNotes size={16} />
                            ) : (
                              <IconNotesOff size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <Link href={`notice/edit/${item.id}`}>
                            <ActionIcon variant="outline" color="yellow">
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Link>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="outline"
                            disabled={deleteNoticeMutation.isLoading}
                            color="red"
                            onClick={() =>
                              deleteNoticeMutation.mutate({
                                noticeId: item.id,
                              })
                            }
                          >
                            {deleteNoticeMutation.isLoading ? (
                              <IconDots size={16} />
                            ) : (
                              <IconTrashX size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              )
            )}
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

const useNoticeListStyle: any = createStyles((theme) => ({
  viewport: {
    minHeight: 600,
  },
}));
