import { Button, Group, Text, TextInput } from "@mantine/core";
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { useMemo, useState } from "react";
import RichTextEditor from "../components/RichText";

function CreateNotice() {
  const modules = useMemo(
    () => ({
      history: { delay: 2500, userOnly: true },
      syntax: true,
    }),
    []
  );
  const [rteValue, setrteValue] = useState("<p>works</p>");
  const openPublishDialog = () =>
    openConfirmModal({
      title: "This is modal at second layer",
      labels: { confirm: "Publish", cancel: "Back" },
      closeOnConfirm: false,
      children: (
        <Text size="sm">
          When this modal is closed modals state will revert to first modal
        </Text>
      ),
      onConfirm: closeAllModals,
    });

  const onChangeRTE = (value: string) => setrteValue(value);
  return (
    <Group position="center">
      <Button
        size="md"
        fullWidth
        onClick={() =>
          openModal({
            fullScreen: true,
            title: "Add a Notice",
            children: (
              <form onSubmit={openPublishDialog}>
                <TextInput mb={10} placeholder="Notice Title" />
                <RichTextEditor
                  modules={modules}
                  controls={[
                    [
                      "bold",
                      "italic",
                      "underline",
                      "codeBlock",
                      "blockquote",
                      "link",
                      "image",
                    ],
                    ["unorderedList", "orderedList"],
                    ["h1", "h2", "h3"],
                    ["alignLeft", "alignCenter", "alignRight"],
                  ]}
                  value={rteValue}
                  onChange={onChangeRTE}
                />
                <Group position="right">
                  <Button onClick={() => {}} variant="subtle" mt="md">
                    Save as Draft
                  </Button>
                  <Button type="submit" mt="md">
                    Next
                  </Button>
                </Group>
              </form>
            ),
          })
        }
      >
        Create A Notice
      </Button>
    </Group>
  );
}

export default CreateNotice;
