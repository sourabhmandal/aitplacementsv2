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
import { useBackendApiContext } from "../../context/backend.api";
import { GetNoticeListOutput } from "../../src/schema/notice.schema";

function PublishedNotices({
  setnoticeId,
  setOpenNoticeDialog,
}: {
  setnoticeId: any;
  setOpenNoticeDialog: any;
}) {
  const backend = useBackendApiContext();
  const [pageNos, setpageNos] = useState(1);

  const publishedNoticeQueryData = backend?.publishedNoticeQuery(pageNos);
  const userInfoListStyle = useNoticeListStyle();
  const [totalPages, settotalPages] = useState(1);
  const [fetchedNotice, setfetchedNotice] = useState<GetNoticeListOutput>({
    totalNotice: 0,
    notices: [],
  });
  // for setting total page numbers of pagination component
  useEffect(() => {
    const noticeNos: number = fetchedNotice?.totalNotice!;
    let pages = Math.ceil(noticeNos / 10);
    if (pages == 0) pages += 1;
    settotalPages(pages);
  }, [fetchedNotice, totalPages]);

  useEffect(() => {
    if (publishedNoticeQueryData?.isSuccess) {
      setfetchedNotice(publishedNoticeQueryData?.data!);
    }
  }, [
    publishedNoticeQueryData?.isLoading,
    publishedNoticeQueryData?.isSuccess,
  ]);

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
          {fetchedNotice?.notices.map((item) => (
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
                  {item.updatedAt.toDateString()}
                </Text>
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
  );
}

export default PublishedNotices;

const useNoticeListStyle = createStyles((_theme, _params, getRef) => ({
  viewport: {
    minHeight: 600,
  },
}));
