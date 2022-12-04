import {
  Badge,
  Card,
  Divider,
  Image,
  Modal,
  Overlay,
  SimpleGrid,
  Skeleton,
  Space,
  Text,
  Title,
  Tooltip,
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useMediaQuery } from "@mantine/hooks";
import { IconFileUpload } from "@tabler/icons";
import { Dispatch, SetStateAction, useState } from "react";
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
  const noticeDetailQuery = trpc.useQuery([
    "notice.notice-detail",
    { id: noticeId },
  ]);
  const theme = useMantineTheme();
  const [imageOverlayVisibleFor, setimageOverlayVisibleFor] =
    useState<string>("");

  const PreviewsAttachments = noticeDetailQuery?.data?.attachments.map(
    (file, index) => {
      if (IMAGE_MIME_TYPE.find((f) => f == file.type) == undefined) {
        return (
          <Card
            p={4}
            key={file.name}
            sx={{
              border: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => {
              window.open(file.url, "_blank");
            }}
          >
            <IconFileUpload
              color={
                theme.colors[theme.primaryColor][
                  theme.colorScheme === "dark" ? 4 : 6
                ]
              }
            />
            <div style={{ marginLeft: 6 }}>
              <Text size="sm">{file.name}</Text>
              <Text color="dimmed" size="xs">
                {file.type}
              </Text>
            </div>
          </Card>
        );
      } else {
        return (
          <Tooltip
            multiline
            position="top"
            closeDelay={120}
            key={file.name}
            label={file.name}
            withinPortal
          >
            <Card
              sx={{
                border: "1px solid #ccc",
                backgroundColor: "#fff2e5",
                borderRadius: "0.5em",
                cursor: "pointer",
              }}
              p={2}
              m={0}
              onClick={() => {
                window.open(file.url, "_blank");
              }}
              onMouseOver={() => setimageOverlayVisibleFor(file.name)}
              onMouseLeave={() => setimageOverlayVisibleFor("")}
            >
              {imageOverlayVisibleFor == file.name && (
                <Overlay
                  opacity={0.6}
                  color="#000"
                  zIndex={5}
                  blur={2}
                ></Overlay>
              )}

              <Image
                src={file.url}
                alt={file.name}
                height={150}
                fit="none"
                caption={
                  <Text
                    size="sm"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.name}
                  </Text>
                }
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "0.5em",
                }}
              />
            </Card>
          </Tooltip>
        );
      }
    }
  );

  return (
    <Modal
      fullScreen={matches ? false : true}
      centered
      overflow="outside"
      opened={openNoticeDialog}
      onClose={() => {
        setOpenNoticeDialog(false);
      }}
      size="xl"
      radius="md"
      title={
        <>
          {noticeDetailQuery?.isLoading! ? (
            <Skeleton height={50} radius="xl" width="100%" />
          ) : (
            <Title order={1}>{noticeDetailQuery?.data?.title}</Title>
          )}
        </>
      }
      withCloseButton
    >
      <>
        {noticeDetailQuery?.data?.tags.length! > 0 ? (
          <Skeleton visible={noticeDetailQuery?.isLoading!}>
            <Divider variant="dotted" />
            <Space h="xs" />
            {noticeDetailQuery?.data?.tags.map((item, idx) => (
              <Badge key={idx} color="orange">
                {item}
              </Badge>
            ))}
            <Space h="xs" />
          </Skeleton>
        ) : (
          <></>
        )}

        {PreviewsAttachments?.length! > 0 ? (
          <Skeleton visible={noticeDetailQuery?.isLoading!}>
            <SimpleGrid cols={3} mt={8}>
              {PreviewsAttachments}
            </SimpleGrid>
            <Space h="xl" />
          </Skeleton>
        ) : (
          <></>
        )}

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
  return (
    <Skeleton visible={isLoading}>
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </TypographyStylesProvider>
    </Skeleton>
  );
}
