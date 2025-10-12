"use client";

import { ConfigurationProps } from "@vivid/builder";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
import { VideoProps } from "./schema";
import { videoShortcuts } from "./shortcuts";

export const VideoToolbar = (props: ConfigurationProps<VideoProps>) => (
  <ShortcutsToolbar
    shortcuts={videoShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
