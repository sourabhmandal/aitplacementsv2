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
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { v4 } from "uuid";
import RichTextEditor from "../../../components/RichText";
import { CreateNoticeInput } from "../../schema/notice.schema";
import { createAWSFilePath } from "../../utils/constants";
import { trpc } from "../../utils/trpc";

const CreateNotice: NextPage<IPropsCreateNotice> = ({ id }) => {
  const [tags, setTags] = useState<MultiSelectItem[]>([
    { value: "COMP", label: "COMP" },
    { value: "IT", label: "IT" },
    { value: "ENTC", label: "ENTC" },
    { value: "MECH", label: "MECH" },
  ]);
  const rteStyles = useRteStyles();
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data } = useSession();
  const router = useRouter();
  const theme = useMantineTheme();

  const form = useForm<CreateNoticeInput>({
    initialValues: {
      id: id,
      tags: [],
      adminEmail: data?.user?.email!,
      isPublished: true,
      title: "",
      body: "",
      attachments: [],
    },
    validate: {
      title: (val: string) =>
        val.length > 80
          ? "Title too large, keep title less than 80 letters"
          : null,
      body: (val: string) => (val == "" ? "Notice body cannot be empty" : null),
    },
  });

  const createPresignedUrlMutation = trpc.useMutation(
    "attachment.create-presigned-url"
  );
  const createNoticeMutation = trpc.useMutation("notice.create-notice");

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
    formdata.tags = selectedTags;
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
          data={tags}
          label="Tags"
          placeholder="Add tags for this post"
          mb={40}
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query: string) => {
            setTags((current: any) => [...current, query]);
            setSelectedTags((current: any) => [...current, query]);
            return query;
          }}
          onChange={(values: string[]) => {
            setSelectedTags(values);
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
          multiple={true}
          useFsAccessApi={false}
          onDrop={(files) => {
            setacceptedFileList((prev) => [...prev, ...files]);
            files.map((file) =>
              form.setFieldValue("attachments", [
                ...form.values.attachments,
                {
                  fileid: createAWSFilePath(id, file.name),
                  filename: file.name,
                  filetype: file.type,
                },
              ])
            );
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
        {/* 
        <Switch
          size="lg"
          my="lg"
          mx="sm"
          onLabel="PUBLISH"
          offLabel="DRAFT"
          checked={form.values.isPublished}
          onChange={(event) =>
            form.setFieldValue("isPublished", event.currentTarget.checked)
          }
          thumbIcon={
            form.values.isPublished ? (
              <IconCheck
                size={12}
                color={theme.colors.teal[theme.fn.primaryShade()]}
                stroke={3}
              />
            ) : (
              <IconX
                size={12}
                color={theme.colors.red[theme.fn.primaryShade()]}
                stroke={3}
              />
            )
          }
        /> */}
        <SegmentedControl
          fullWidth
          size="md"
          my="xl"
          color={theme.fn.lighten(theme.fn.primaryColor(), 0.9)}
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

export const getServerSideProps = async (context: any) => {
  console.log(context.params);
  return {
    props: {
      id: v4(),
    },
  };
};

interface IPropsCreateNotice {
  id: string;
}

const useRteStyles = createStyles(() => ({
  root: {
    minHeight: 150,
  },
}));