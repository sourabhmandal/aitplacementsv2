import { showNotification } from "@mantine/notifications";

export const showCommingSoon = () =>
  showNotification({
    title: "Comming Soon",
    message: "this feature is not available yet",
    color: "lime",
  });
