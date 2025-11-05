"use client";

import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { VideoProps } from "./schema";
import { videoShortcuts } from "./shortcuts";

export const VideoToolbar = (props: ConfigurationProps<VideoProps>) => (
  <ShortcutsToolbar
    shortcuts={videoShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
