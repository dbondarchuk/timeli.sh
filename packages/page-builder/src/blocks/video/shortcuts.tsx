import { Shortcut } from "@vivid/page-builder-base";
import { AlignLeft, Film, Play, Volume2 } from "lucide-react";
import { VideoStylesSchema } from "./styles";

export const videoShortcuts: Shortcut<VideoStylesSchema>[] = [
  {
    label: "pageBuilder.blocks.video.size",
    icon: ({ className }) => <Film className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.video.sizes.small",
        value: "small",
        targetStyles: {
          width: {
            value: 320,
            unit: "px",
          },
        },
      },
      {
        label: "pageBuilder.blocks.video.sizes.medium",
        value: "medium",
        targetStyles: {
          width: {
            value: 640,
            unit: "px",
          },
        },
      },
      {
        label: "pageBuilder.blocks.video.sizes.large",
        value: "large",
        targetStyles: {
          width: {
            value: 960,
            unit: "px",
          },
        },
      },
      {
        label: "pageBuilder.blocks.video.sizes.full",
        value: "full",
        targetStyles: {
          width: {
            value: 100,
            unit: "%",
          },
        },
      },
      {
        label: "pageBuilder.blocks.video.sizes.wide",
        value: "wide",
        targetStyles: {
          width: {
            value: 100,
            unit: "%",
          },
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.video.alignment",
    icon: ({ className }) => <AlignLeft className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.video.alignments.standard",
        value: "standard",
        targetStyles: {
          display: "inline-block",
          margin: (prev) => ({
            top: prev?.top ?? "auto",
            bottom: prev?.bottom ?? "auto",
            left: {
              value: 0,
              unit: "px",
            },
            right: {
              value: 0,
              unit: "px",
            },
          }),
        },
      },
      {
        label: "pageBuilder.blocks.video.alignments.center",
        value: "center",
        targetStyles: {
          display: "block",
          margin: (prev) => ({
            top: prev?.top ?? "auto",
            bottom: prev?.bottom ?? "auto",
            left: "auto",
            right: "auto",
          }),
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.video.playback",
    icon: ({ className }) => <Play className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.video.playbackOptions.standard",
        value: "standard",
        targetStyles: {},
        targetProps: {
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
        },
      },
      {
        label: "pageBuilder.blocks.video.playbackOptions.autoplay",
        value: "autoplay",
        targetStyles: {},
        targetProps: {
          controls: true,
          autoplay: true,
          loop: false,
          muted: true,
        },
      },
      {
        label: "pageBuilder.blocks.video.playbackOptions.loop",
        value: "loop",
        targetStyles: {},
        targetProps: {
          controls: true,
          autoplay: false,
          loop: true,
          muted: false,
        },
      },
      {
        label: "pageBuilder.blocks.video.playbackOptions.background",
        value: "background",
        targetStyles: {},
        targetProps: {
          controls: false,
          autoplay: true,
          loop: true,
          muted: true,
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.video.audio",
    icon: ({ className }) => <Volume2 className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.video.audioOptions.withSound",
        value: "withSound",
        targetStyles: {},
        targetProps: {
          muted: false,
        },
      },
      {
        label: "pageBuilder.blocks.video.audioOptions.muted",
        value: "muted",
        targetStyles: {},
        targetProps: {
          muted: true,
        },
      },
    ],
  },
];
