import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Container,
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
import { GetServerSidePropsResult, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RichTextEditor from "../../../../components/RichText";
import { useBackendApiContext } from "../../../../context/backend.api";
import {
  CreateNoticeInput,
  GetNoticeDetailOutput,
} from "../../../schema/notice.schema";
import { createAWSFilePath } from "../../../utils/constants";
import { trpc } from "../../../utils/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";
import { noticeRouter } from "../../api/server/routes/notice.router";

const CreateNotice: NextPage<IPropsCreateNotice> = ({
  id,
  useremail,
  noticeDetails,
}) => {
  const [defaultTags, setDefaultTags] = useState<MultiSelectItem[]>([
    { value: "COMP", label: "COMP" },
    { value: "IT", label: "IT" },
    { value: "ENTC", label: "ENTC" },
    { value: "MECH", label: "MECH" },
  ]);
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  const backend = useBackendApiContext();
  const router = useRouter();
  const theme = useMantineTheme();
  const trpcContext = trpc.useContext();

  const updateNoticeMutation = trpc.useMutation("notice.update-notice");
  const noticeDetailQuery = trpc.useQuery(["notice.notice-detail", { id }]);

  useEffect(() => {
    if (noticeDetailQuery.isSuccess && noticeDetailQuery.data) {
      form.setFieldValue(
        "attachments",
        noticeDetailQuery.data.attachments.map((f) => ({
          fileid: createAWSFilePath(id, f.name),
          filename: f.name,
          filetype: f.type,
        }))
      );
    }
  }, [
    noticeDetailQuery.isSuccess,
    noticeDetailQuery.data,
    noticeDetailQuery.isFetched,
  ]);

  const form = useForm<CreateNoticeInput>({
    initialValues: {
      id: noticeDetails.id,
      tags: noticeDetails.tags,
      adminEmail: useremail,
      title: noticeDetails.title,
      body: noticeDetails.body,
      attachments: noticeDetails.attachments.map((atth) => ({
        fileid: createAWSFilePath(noticeDetails.id, atth.name),
        filename: atth.name,
        filetype: atth.type,
      })),
      isPublished: noticeDetails.isPublished,
    },
    validate: {
      title: (val: string) =>
        val.length > 80
          ? "Title too large, keep title less than 80 letters"
          : null,
      body: (val: string) => (val == "" ? "Notice body cannot be empty" : null),
    },
  });

  const uploadFile = async (targetFile: FileWithPath) => {
    const filepath = `${form.values.id}/${targetFile.name}`;
    const { url, fields } =
      (await backend?.createPresignedUrlMutation.mutateAsync({
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

    trpcContext.invalidateQueries("notice.published-notice-list");
    trpcContext.invalidateQueries("notice.my-notices");

    router.push("/dashboard");
  };

  const deleteNoticeByFileId = trpc.useMutation(
    "attachment.delete-attachment-by-fileid"
  );

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

  const PreviewsRemoteFiles = form.values.attachments.map((file, index) => {
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
                  trpcContext.invalidateQueries("notice.notice-detail");
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
          label="Tags"
          placeholder="Add tags for this post"
          mb={40}
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query: string) => {
            setDefaultTags((current: any) => [...current, query]);
            return query;
          }}
          onChange={(values: string[]) => {
            console.log(form.values.tags);
            return values;
          }}
          maxDropdownHeight={160}
        />
        <RichTextEditor
          placeholder="Write your notice body here"
          controls={[
            ["bold", "italic", "underline", "blockquote", "link", "image"],
            ["unorderedList", "orderedList"],
            ["h1", "h2", "h3"],
            ["alignLeft", "alignCenter", "alignRight"],
          ]}
          key="jkhdkjh"
          value={form.values.body}
          onChange={(data) => {
            form.setFieldValue("body", data);
          }}
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
          Publish Notice
        </Button>
      </form>
    </Container>
  );
};

export default CreateNotice;

export const getServerSideProps = async (
  context: any
): Promise<GetServerSidePropsResult<IPropsCreateNotice>> => {
  const { id } = context.params;
  let session: Session | null = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const noticeDetail: GetNoticeDetailOutput = await noticeRouter
    .createCaller({
      req: context.req,
      res: context.res,
      prisma: prisma,
    })
    .query("notice-detail", { id });

  return {
    props: {
      id: id,
      useremail: session.user.email,
      noticeDetails: noticeDetail,
    },
  };
};

interface IPropsCreateNotice {
  id: string;
  useremail: string;
  noticeDetails: GetNoticeDetailOutput;
}
