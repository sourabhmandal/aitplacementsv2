import {
  Badge,
  Card,
  Divider,
  Image,
  Loader,
  Modal,
  Space,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { useBackendApiContext } from "../context/backend.api";

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
  const backend = useBackendApiContext();
  const noticeDetailQuery = backend?.noticeDetailQuery(noticeId);

  const PreviewsAttachments = noticeDetailQuery?.data?.attachments.map(
    (file, index) => {
      if (IMAGE_MIME_TYPE.find((f) => f == file.type) == undefined) {
        return (
          <Card
            p={4}
            sx={{
              border: "1px solid #ccc",
              cursor: "pointer",
              minWidth: "8rem",
            }}
            key={index}
            style={{ position: "absolute" }}
          >
            <Link
              style={{ position: "relative", padding: 8, margin: 4 }}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                <Text size="sm">{file.name}</Text>
                <Text color="dimmed" size="xs">
                  {file.type}
                </Text>
              </div>
            </Link>
          </Card>
        );
      } else {
        return (
          <Link
            key={index}
            style={{ border: "1px solid #ccc", padding: 8, margin: 4 }}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              key={index}
              src={file.url}
              alt={file.name}
              height={100}
              width={100}
              caption={<Text size="sm">{file.name}</Text>}
            />
          </Link>
        );
      }
    }
  );

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
      title={<Title order={1}>{noticeDetailQuery?.data?.title}</Title>}
      withCloseButton
    >
      <>
        <Space h="sm" />
        <Divider variant="dotted" />
        <Space h="xl" />
        {noticeDetailQuery?.data?.tags.map((item, idx) => (
          <Badge key={idx} color="orange">
            {item}
          </Badge>
        ))}
        <Space h="md" />
        {PreviewsAttachments}
        <Space h="xl" />
        <Space h="xl" />
        <Divider variant="dotted" />
        <Space h="xl" />

        <NoticeBody
          isLoading={noticeDetailQuery?.isLoading!}
          html={noticeDetailQuery?.data?.body!}
        />
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
