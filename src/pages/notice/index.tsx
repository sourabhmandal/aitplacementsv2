import {
  ActionIcon,
  Button,
  Card,
  Center,
  Container,
  Group,
  MultiSelect,
  Radio,
  SimpleGrid,
  Space,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Link } from "@mantine/tiptap";
import { IconFileUpload, IconX } from "@tabler/icons";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { v4 } from "uuid";
import RichTextNoticeEditor from "../../components/RichText";
import { CreateNoticeInput } from "../../schema/notice.schema";
import { createAWSFilePath } from "../../utils/constants";
import { trpc } from "../../utils/trpc";

const CreateNotice: NextPage<IPropsCreateNotice> = ({ id }) => {
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  const { data } = useSession();
  const router = useRouter();
  const theme = useMantineTheme();

  const form = useForm<CreateNoticeInput>({
    initialValues: {
      id: id,
      adminEmail: data?.user?.email!,
      isPublished: false,
      title: "",
      body: "",
      attachments: [],
    },
    validate: {
      title: (val: string) =>
        val.length > 80
          ? "Title too large, keep title less than 80 letters"
          : null,
      body: (val: string) =>
        val == "<p></p>" ? "Notice body cannot be empty" : null,
    },
  });

  const createPresignedUrlMutation =
    trpc.attachment.createPresignedUrl.useMutation({
      onError: (error) => {
        showNotification({
          message: error.message,
          title: error.data?.code,
        });
      },
    });
  const createNoticeMutation = trpc.notice.createNotice.useMutation({
    onError: (error) => {
      showNotification({
        message: error.message,
        title: error.data?.code,
      });
    },
  });

  const uploadFile = async (targetFile: FileWithPath) => {
    const filepath = `${form.values.id}/${targetFile.name}`;
    const { url, fields } = (await createPresignedUrlMutation.mutateAsync({
      filepath: filepath,
    })) as any;

    const data = {
      ...fields,
      "Content-Type": targetFile.type,
      file: targetFile,
    };

    const formData = new FormData();
    for (const name in data) {
      formData.append(name, data[name]);
    }

    try {
      fetch(url, {
        method: "POST",
        body: formData,
      });

      form.setFieldValue("attachments", [
        ...form.values.attachments,
        {
          fileid: filepath,
          filename: targetFile.name,
          filetype: targetFile.type,
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const savePost = async (formdata: CreateNoticeInput) => {
    console.log(formdata);
    await acceptedFileList.map((file) => uploadFile(file));

    // add unique ids list as attachments
    await createNoticeMutation.mutate(formdata);
    router.push("/dashboard");
  };

  const PreviewsImage = acceptedFileList.map((file, index) => {
    return (
      <Card
        p={4}
        key={index}
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
          <Text size="sm">{file.name}</Text>
          <Text color="dimmed" size="xs">
            {file.type}
          </Text>
        </div>
        <ActionIcon
          variant="light"
          onClick={() => {
            // remove from files
            let revisedFiles = acceptedFileList.filter(
              (filterfile) => file.name != filterfile.name
            );
            setacceptedFileList(revisedFiles);
            form.setFieldValue(
              "attachments",
              revisedFiles.map((f) => ({
                fileid: createAWSFilePath(id, f.name),
                filename: f.name,
                filetype: f.type,
              }))
            );
          }}
        >
          <IconX />
        </ActionIcon>
      </Card>
    );
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      Placeholder.configure({ placeholder: "Create a notice body here" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate({ editor }) {
      form.setFieldValue("body", editor.getHTML());
    },
  });

  return (
    <>
      <Head>
        <title>AIT Placements</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Space h="lg" />
      <Container>
        <form
          onSubmit={form.onSubmit((data: CreateNoticeInput) => savePost(data))}
        >
          <TextInput
            required
            label="Notice Title"
            mb={10}
            placeholder="Set a notice title"
            onChange={(e) => {
              form.setFieldValue("title", e.target.value);
            }}
            value={form.values.title}
            error={form.errors.title && "Invalid title"}
          />

          <RichTextNoticeEditor editor={editor} key="jkhdkjh" />

          <Dropzone
            multiple={true}
            useFsAccessApi={false}
            onDrop={(files) => {
              files.map((file) => {
                if (
                  form.values.attachments.findIndex(
                    (f) => f.filename === file.name
                  ) >= 0
                ) {
                  return;
                }
                setacceptedFileList((prev) => [...prev, ...files]);

                form.setFieldValue("attachments", [
                  ...form.values.attachments,
                  {
                    fileid: createAWSFilePath(id, file.name),
                    filename: file.name,
                    filetype: file.type,
                  },
                ]);
              });
            }}
            onReject={() =>
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
                  Attach as many files as you like, each file should not exceed
                  20mb
                </Text>
              </div>
            </Group>
          </Dropzone>
          <SimpleGrid cols={3} mt={8}>
            {PreviewsImage}
          </SimpleGrid>

          <Center p="lg">
            <Radio.Group
              name="favoriteFramework"
              label="How should his notice be saved?"
              description="Save it as drafted or published"
              withAsterisk
              defaultValue="draft"
              onChange={(data) =>
                form.setFieldValue("isPublished", data == "publish")
              }
              size="lg"
              spacing={180}
            >
              <Radio value="draft" label="Save as Drafted" />
              <Radio value="publish" label="Save as Published" />
            </Radio.Group>
          </Center>
          <Button type="submit" mt="md" fullWidth>
            Save Notice to Database
          </Button>
        </form>
      </Container>
      <Space h="lg" />
    </>
  );
};

export default CreateNotice;

export const getServerSideProps = async () => {
  return {
    props: {
      id: v4(),
    },
  };
};

interface IPropsCreateNotice {
  id: string;
}
