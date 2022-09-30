import {
  ActionIcon,
  Card,
  Group,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  Dropzone,
  DropzoneProps,
  FileWithPath,
  MIME_TYPES,
} from "@mantine/dropzone";
import { showNotification } from "@mantine/notifications";
import { IconFileUpload, IconX } from "@tabler/icons";
import { useState } from "react";

export function DropFileUpload(props: Partial<DropzoneProps>) {
  const theme = useMantineTheme();
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  return (
    <>
      <Dropzone
        multiple
        onDrop={(files) => {
          setacceptedFileList(files);
        }}
        onReject={(files) =>
          showNotification({
            message: `file type not accepted`,
            title: "Unsupported file",
            color: "red",
          })
        }
        maxSize={20 * 1024 ** 2} // 20 mb
        accept={[
          MIME_TYPES.csv,
          MIME_TYPES.doc,
          MIME_TYPES.docx,
          MIME_TYPES.gif,
          MIME_TYPES.jpeg,
          MIME_TYPES.mp4,
          MIME_TYPES.pdf,
          MIME_TYPES.png,
          MIME_TYPES.ppt,
          MIME_TYPES.pptx,
          MIME_TYPES.svg,
          MIME_TYPES.webp,
          MIME_TYPES.xls,
          MIME_TYPES.xlsx,
          MIME_TYPES.zip,
        ]}
        {...props}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: 120, pointerEvents: "none" }}
        >
          <div>
            <Text size="xl" inline>
              Drag files here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 20mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      <SimpleGrid cols={3} mt={8}>
        {acceptedFileList.map((item) => (
          <Card
            p={4}
            key={item.name}
            sx={{
              border: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
              <Text size="sm">{item.name}</Text>
              <Text color="dimmed" size="xs">
                {item.type}
              </Text>
            </div>
            <ActionIcon
              variant="light"
              onClick={() => {
                // remove from files
                let revisedFiles = acceptedFileList.filter(
                  (filteritem) => item.name != filteritem.name
                );
                setacceptedFileList(revisedFiles);
              }}
            >
              <IconX />
            </ActionIcon>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
