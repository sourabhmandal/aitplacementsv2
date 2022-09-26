import {
  Badge,
  Divider,
  Loader,
  Modal,
  Space,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Dispatch, SetStateAction } from "react";
import { trpc } from "../src/utils/trpc";

function NoticeDetailModal({
  noticeId,
  openNoticeDialog,
  setOpenNoticeDialog,
}: {
  noticeId: string;
  openNoticeDialog: boolean;
  setOpenNoticeDialog: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { isLoading, data } = trpc.useQuery(
    ["notice.notice-detail", { id: noticeId }],
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    }
  );

  return (
    <Modal
      fullScreen={true}
      centered
      opened={openNoticeDialog}
      onClose={() => {
        setOpenNoticeDialog(false);
      }}
      size="xl"
      radius="md"
      title={
        data?.isPublished ? (
          <>
            <Title order={1}>{data?.title}</Title>
            <Badge size="sm" color="violet">
              Published
            </Badge>
          </>
        ) : (
          <>
            <Title order={1}>{data?.title}</Title>
            <Badge size="sm" color="orange">
              Draft
            </Badge>
          </>
        )
      }
      withCloseButton
    >
      <Space h="sm" />
      <Divider variant="dotted" />
      <Space h="xl" />
      <NoticeBody isLoading={isLoading} html={data?.body!} />
    </Modal>
  );
}

export default NoticeDetailModal;

function NoticeBody({
  isLoading,
  html,
}: {
  isLoading: boolean;
  html: string;
}): JSX.Element {
  if (isLoading) return <Loader color="orange" />;
  return (
    <TypographyStylesProvider>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </TypographyStylesProvider>
  );
}
