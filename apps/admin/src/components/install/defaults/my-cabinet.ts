import { pageDefault } from "./page";

export const myCabinetDefaultPage = (
  myCabinetAppId: string,
  labels: { title: string },
) =>
  pageDefault(
    [
      {
        id: "block-my-cabinet-install-001",
        type: "MyCabinet",
        data: {
          props: {
            showTitle: false,
            scrollToTop: true,
          },
          style: {},
        },
        metadata: {
          myCabinetAppId,
        },
      },
    ],
    labels.title,
  );
