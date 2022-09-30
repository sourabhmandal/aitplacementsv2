import {
  Button,
  createStyles,
  Grid,
  Group,
  Modal,
  MultiSelect,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import RichTextEditor from "@mantine/rte";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "../src/utils/trpc";
import { DropFileUpload } from "./DropFileUpload";

function CreateNotice() {
  const [tags, setTags] = useState<MultiSelectItem[]>([
    { value: "COMP", label: "COMP" },
    { value: "IT", label: "IT" },
    { value: "ENTC", label: "ENTC" },
    { value: "MECH", label: "MECH" },
  ]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const matches = useMediaQuery("(min-width: 600px)");

  const form = useForm<CreateNoticeForm>({
    initialValues: {
      title: "",
      body: "",
      isDraft: false,
    },

    validate: {
      title: (val: string) =>
        val.length > 80
          ? "Title too large, keep title less than 80 letters"
          : null,
      body: (val: string) => (val == "" ? "Notice body cannot be empty" : null),
    },
  });
  const { isLoading, mutate } = trpc.useMutation(["notice.create-notice"], {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
    onSuccess(data) {
      showNotification({
        title: "Success",
        message: `Notice "${data.title}" created by admin ${data.adminEmail}`,
        color: "green",
      });
    },
  });
  const { data } = useSession();
  const rteStyle = useRteStyle();
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);

  const savePost = (formdata: CreateNoticeForm) => {
    mutate({
      adminEmail: data?.user?.email || "",
      title: formdata.title,
      body: formdata.body,
      isPublished: !formdata.isDraft,
      tags: selectedTags,
      attachments: [],
    });
    resetForm();
    setOpenNoticeDialog(false);
  };

  function resetForm() {
    form.setFieldValue("body", "");
    form.setFieldValue("isDraft", false);
    form.setFieldValue("title", "");
  }

  return (
    <Group position="center">
      <Button size="md" fullWidth onClick={() => setOpenNoticeDialog(true)}>
        Create A Notice
      </Button>
      <Modal
        fullScreen={matches ? false : true}
        centered
        opened={openNoticeDialog}
        onClose={() => {
          resetForm();
          setOpenNoticeDialog(false);
        }}
        size="xl"
        radius="md"
        title="Publish a notice"
        withCloseButton
      >
        <form onSubmit={form.onSubmit((data) => savePost(data))}>
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
            classNames={rteStyle.classes}
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
          <DropFileUpload />

          <Grid align="center" justify="space-between">
            <Grid.Col span={4}>
              <Switch
                label="Save as draft"
                checked={form.values.isDraft}
                onChange={(event) =>
                  form.setFieldValue("isDraft", event.currentTarget.checked)
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button type="submit" mt="md" fullWidth>
                Publish
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Group>
  );
}

export default CreateNotice;

const useRteStyle = createStyles({
  root: {
    height: 400,
  },
});
