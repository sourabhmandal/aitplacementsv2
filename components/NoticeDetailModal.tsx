import {
  Badge,
  Card,
  Divider,
  Loader,
  Modal,
  Space,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
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
  const matches = useMediaQuery("(min-width: 600px)");
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

  const PreviewsImage = data?.attachments.map((file, index) => {
    return (
      <Link
        href={file.url}
        key={index}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Card
          p={4}
          sx={{
            border: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ marginLeft: 6 }}>
            <Text size="sm">{file.name}</Text>
            <Text color="dimmed" size="xs">
              {file.type}
            </Text>
          </div>
        </Card>
      </Link>
    );
  });

  return (
    <Modal
      fullScreen={matches ? false : true}
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
      <>
        <Space h="sm" />
        <Divider variant="dotted" />
        <Space h="xl" />
        {PreviewsImage}
        <Space h="xl" />
        <NoticeBody isLoading={isLoading} html={data?.body!} />
      </>
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
