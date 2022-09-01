import { Button, createStyles, Group, Text, TextInput } from "@mantine/core";
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { useState } from "react";
import RichTextEditor from "../components/RichText";

function CreateNotice() {
  const [rteValue, setrteValue] = useState<string>();
  const rteStyle = useRteStyle();
  const openPublishDialog = () =>
    openConfirmModal({
      title: "This is modal at second layer",
      labels: { confirm: "Publish", cancel: "Back" },
      closeOnConfirm: false,
      size: 900,
      centered: true,
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
            centered: true,
            title: "Add a Notice",
            size: 900,
            closeOnClickOutside: false,
            children: (
              <form onSubmit={openPublishDialog}>
                <TextInput mb={20} placeholder="Notice Title" />
                <RichTextEditor
                  classNames={rteStyle.classes}
                  placeholder="Write your notice body here"
                  controls={[
                    [
                      "bold",
                      "italic",
                      "underline",
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

const useRteStyle = createStyles({
  root: {
    height: 400,
  },
});
