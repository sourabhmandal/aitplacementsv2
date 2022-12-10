import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Container,
  createStyles,
  Group,
  MultiSelect,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconFileUpload, IconNotes, IconNotesOff, IconX } from "@tabler/icons";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RichTextEditor from "../../../components/RichText";
import { defaultTagsList, MultiSelectItem } from "../../../schema/constants";
import { CreateNoticeInput } from "../../../schema/notice.schema";
import { createAWSFilePath } from "../../../utils/constants";
import { trpc } from "../../../utils/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";

const CreateNotice: NextPage<IPropsCreateNotice> = ({ id, useremail }) => {
  const [defaultTags, setDefaultTags] =
    useState<MultiSelectItem[]>(defaultTagsList);
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  const router = useRouter();
  const theme = useMantineTheme();
  const trpcContext = trpc.useContext();
  const noticeDetailQuery = trpc.notice.noticeDetail.useQuery({ id });
  const updateNoticeMutation = trpc.notice.updateNotice.useMutation({
    onError: (error) => {
      showNotification({
        message: error.message,
        title: error.data?.code,
      });
    },
  });
  const [savedTags, setsavedTags] = useState<string[]>([]);

  const rteStyles = useRteStyles();
  const createPresignedUrlMutation =
    trpc.attachment.createPresignedUrl.useMutation({
      onError: (error) => {
        showNotification({
          message: error.message,
          title: error.data?.code,
        });
      },
    });

  useEffect(() => {
    if (noticeDetailQuery.isSuccess && noticeDetailQuery.data) {
      form.setValues({
        title: noticeDetailQuery.data.title,
        id: noticeDetailQuery.data.id,
        tags: noticeDetailQuery.data.tags,
        isPublished: noticeDetailQuery.data.isPublished,
        adminEmail: useremail,
        attachments: noticeDetailQuery.data.attachments.map((f) => ({
          fileid: createAWSFilePath(id, f.name),
          filename: f.name,
          filetype: f.type,
        })),

        body: noticeDetailQuery.data.body,
      });
    }
  }, [
    noticeDetailQuery.isSuccess,
    noticeDetailQuery.data,
    noticeDetailQuery.isFetched,
  ]);

  const form = useForm<CreateNoticeInput>({
    initialValues: {
      id: "",
      tags: [""],
      adminEmail: useremail,
      title: "",
      body: "",
      attachments: [],
      isPublished: false,
    },
    validate: {
      title: (val: string) =>
        val.length > 80
          ? "Title too large, keep title less than 80 letters"
          : null,
      body: (val: string) => (val == "" ? "Notice body cannot be empty" : null),
    },
  });

  useEffect(() => {
    setsavedTags(noticeDetailQuery.data?.tags!);
  }, [noticeDetailQuery.data?.tags]);

  useEffect(() => {
    form.setFieldValue("tags", savedTags);
  }, [savedTags]);

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
    await acceptedFileList.map((file) => uploadFile(file));

    //const data =;

    formdata.attachments = [
      ...formdata.attachments,
      ...acceptedFileList.map((f) => ({
        fileid: createAWSFilePath(id, f.name),
        filename: f.name,
        filetype: f.type,
      })),
    ];

    // add unique ids list as attachments
    await updateNoticeMutation.mutate(formdata);

    trpcContext.notice.publishedNoticeList.invalidate();
    trpcContext.notice.myNotices.invalidate();
    router.push("/dashboard");
  };

  const deleteNoticeByFileId =
    trpc.attachment.deleteAttachmentByFileid.useMutation({
      onError: (error) => {
        showNotification({
          message: error.message,
          title: error.data?.code,
        });
      },
    });

  const PreviewsLocalFiles = acceptedFileList.map((file, index) => {
    return (
      <Card
        p={4}
        key={file.name}
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
          }}
        >
          <IconX />
        </ActionIcon>
      </Card>
    );
  });

  const PreviewsRemoteFiles = form.values.attachments?.map((file, index) => {
    return (
      <Card
        p={4}
        key={file.fileid}
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
          <Text size="sm">{file.filename}</Text>
          <Text color="dimmed" size="xs">
            {file.filetype}
          </Text>
        </div>
        <ActionIcon
          variant="light"
          onClick={() => {
            // remove from aws files
            deleteNoticeByFileId.mutate(
              { noticeId: id, filename: file.filename },
              {
                onSuccess(variables, context) {
                  showNotification({
                    message: `${context.filename} deleted`,
                  });
                  trpcContext.notice.noticeDetail.invalidate();
                },
              }
            );
          }}
        >
          <IconX />
        </ActionIcon>
      </Card>
    );
  });

  return (
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

        <MultiSelect
          creatable
          searchable
          data={defaultTags}
          value={savedTags}
          label="Tags"
          placeholder="Add tags for this post"
          mb={40}
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query: string) => {
            setDefaultTags((current: any) => [...current, query]);
            let item: any = {
              value: query,
              label: query,
            };
            return item;
          }}
          onChange={(values: string[]) => {
            console.log(form.values.tags, values, savedTags);
            setsavedTags([...values]);
            return values;
          }}
          maxDropdownHeight={160}
        />
        <RichTextEditor
          placeholder="Write your notice body here"
          controls={[
            ["bold", "italic", "underline", "blockquote", "link"],
            ["unorderedList", "orderedList"],
            ["h1", "h2", "h3"],
            ["alignLeft", "alignCenter", "alignRight"],
          ]}
          key="jkhdkjh"
          value={form.values.body}
          onChange={(data) => {
            form.setFieldValue("body", data);
          }}
          classNames={rteStyles.classes}
        />
        <Dropzone
          multiple={false}
          useFsAccessApi={false}
          onDrop={(files) => {
            setacceptedFileList((prev) => [...prev, ...files]);
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
          {PreviewsLocalFiles}
          {PreviewsRemoteFiles}
        </SimpleGrid>

        <SegmentedControl
          fullWidth
          size="md"
          my="xl"
          style={{ background: theme.fn.lighten(theme.fn.primaryColor(), 0.7) }}
          value={form.values.isPublished ? "publish" : "draft"}
          onChange={(data) =>
            form.setFieldValue("isPublished", data == "publish")
          }
          radius="md"
          data={[
            {
              value: "draft",
              label: (
                <Center>
                  <IconNotesOff size={18} />
                  <Box ml={10}>Draft</Box>
                </Center>
              ),
            },
            {
              label: (
                <Center>
                  <IconNotes size={18} />
                  <Box ml={10}>Publish</Box>
                </Center>
              ),
              value: "publish",
            },
          ]}
        />
        <Button type="submit" mt="md" fullWidth>
          Save Notice to Database
        </Button>
      </form>
    </Container>
  );
};

export default CreateNotice;

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ id: string }>
): Promise<GetServerSidePropsResult<IPropsCreateNotice>> => {
  const id = context.params?.id as string;
  let session: Session | null = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      useremail: session.user.email,
      id: id,
    },
  };
};

interface IPropsCreateNotice {
  id: string;
  useremail: string;
}

const useRteStyles = createStyles(() => ({
  root: {
    minHeight: 150,
  },
}));