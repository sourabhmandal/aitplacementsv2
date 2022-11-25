import {
  ActionIcon,
  Button,
  Card,
  Container,
  Grid,
  Group,
  MultiSelect,
  SimpleGrid,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconFileUpload, IconX } from "@tabler/icons";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import RichTextEditor from "../../../components/RichText";
import { useBackendApiContext } from "../../../context/backend.api";
import { CreateNoticeInput } from "../../schema/notice.schema";

const CreateNotice: NextPage<IPropsCreateNotice> = ({ id }) => {
  const [tags, setTags] = useState<MultiSelectItem[]>([
    { value: "COMP", label: "COMP" },
    { value: "IT", label: "IT" },
    { value: "ENTC", label: "ENTC" },
    { value: "MECH", label: "MECH" },
  ]);
  const [acceptedFileList, setacceptedFileList] = useState<FileWithPath[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data } = useSession();
  const backend = useBackendApiContext();
  const router = useRouter();
  const theme = useMantineTheme();

  // const { mutateAsync: createPresignedUrl } = trpc.useMutation([
  //   "attachment.create-presigned-url",
  // ]);
  console.log(id);

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

  useEffect(() => {
    const len: number = acceptedFileList.length;
    const targetFile: FileWithPath = acceptedFileList[len - 1];
    if (len == 0) return;
    (async () => {
      const filepath = `${form.values.id}/${Date.now()}-${targetFile.name}`;
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
    })();
    return () => {};
  }, [acceptedFileList, form.values.id]);

  const savePost = async (formdata: CreateNoticeInput) => {
    formdata.tags = selectedTags;

    // add unique ids list as attachments
    backend?.createNoticeMutation.mutate(formdata);
    resetForm();
    router.push("/dashboard");
  };

  function resetForm() {
    form.setFieldValue("id", router.query.id as string);
    form.setFieldValue("tags", []);
    form.setFieldValue("adminEmail", data?.user?.email!);
    form.setFieldValue("title", "");
    form.setFieldValue("body", "");
    form.setFieldValue("isPublished", true);
    form.setFieldValue("attachments", []);
  }

  const PreviewsImage = acceptedFileList.map((file, index) => {
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

  return (
    <Container>
      {/* <Modal
        fullScreen={true}
        centered
        opened={openNoticeDialog}
        onClose={() => {
          resetForm();
          setOpenNoticeDialog(false);
          setacceptedFileList([]);
        }}
        size="xl"
        radius="md"
        title="Publish a notice"
        withCloseButton
      > */}
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
          {PreviewsImage}
        </SimpleGrid>

        <Grid align="center" justify="space-between" my={4}>
          <Grid.Col span={6}>
            <Button type="submit" mt="md" fullWidth variant="light">
              Save as Draft
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button type="submit" mt="md" fullWidth>
              Publish Notice
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Container>
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
