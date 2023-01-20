import {
  Badge,
  Center,
  createStyles,
  Pagination,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { NoticeMetadata } from "../../schema/notice.schema";
import { trpc } from "../../utils/trpc";

function PublishedNotices({
  setnoticeId,
  setOpenNoticeDialog,
}: {
  setnoticeId: any;
  setOpenNoticeDialog: any;
}) {
  const [pageNos, setpageNos] = useState(1);
  const publishedNoticeQueryData = trpc.notice.publishedNoticeList.useQuery({
    pageNos,
  });

  const userInfoListStyle = useNoticeListStyle();
  const [totalPages, settotalPages] = useState(1);
  const trpcContext = trpc.useContext();

  // for setting total page numbers of pagination component
  useEffect(() => {
    const noticeNos: number = publishedNoticeQueryData.data?.totalNotice!;
    let pages = Math.ceil(noticeNos / 10);
    if (pages == 0) pages += 1;
    settotalPages(pages);
  }, [totalPages, publishedNoticeQueryData.data]);

  useEffect(() => {
    trpcContext.notice.publishedNoticeList.invalidate();
  }, [pageNos]);

  return (
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
          {publishedNoticeQueryData.data?.notices?.map(
            (item: NoticeMetadata) => (
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
                  {item.tags?.map((item, idx) => (
                    <Badge key={idx} variant="outline" color={"orange"} mr={4}>
                      {item}
                    </Badge>
                  ))}
                </td>

                <td>
                  <Text size="xs" weight={"bolder"}>
                    {item.admin}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {item.updatedAt}
                  </Text>
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
  );
}

export default PublishedNotices;

const useNoticeListStyle = createStyles((_theme, _params, getRef) => ({
  viewport: {
    minHeight: 600,
  },
}));
