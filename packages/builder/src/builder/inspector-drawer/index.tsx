import {
  useSelectedBlockId,
  useSelectedSidebarTab,
  useSetSidebarTab,
} from "../../documents/editor/context";

import { useI18n } from "@vivid/i18n";
import {
  Sidebar,
  SidebarContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vivid/ui";
import { Paintbrush, SquareDashedMousePointer } from "lucide-react";
import React, { memo, useEffect, useMemo } from "react";
import {
  ConfigurationPanel,
  ConfigurationPanelTab,
} from "./configuration-panel";
import { StylesPanel, StylesPanelTab } from "./styles-panel";

// Define the SidebarTab type
export type SidebarTab = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

const SelectBlockListener: React.FC = memo(() => {
  const selectedBlockId = useSelectedBlockId();
  const setSidebarTab = useSetSidebarTab();
  useEffect(() => {
    if (selectedBlockId) {
      setSidebarTab(ConfigurationPanelTab);
    } else {
      setSidebarTab(StylesPanelTab);
    }
  }, [selectedBlockId, setSidebarTab]);
  return null;
});

export const InspectorDrawer: React.FC<{ extraTabs?: SidebarTab[] }> = ({
  extraTabs = [],
}) => {
  const selectedTab = useSelectedSidebarTab();
  const setSidebarTab = useSetSidebarTab();
  const t = useI18n("builder");

  const allTabs = useMemo(
    () => [
      {
        value: StylesPanelTab,
        label: t("baseBuilder.inspector.styles"),
        icon: <Paintbrush size={16} />,
        content: <StylesPanel />,
      },
      {
        value: ConfigurationPanelTab,
        label: t("baseBuilder.inspector.inspect"),
        icon: <SquareDashedMousePointer size={16} />,
        content: <ConfigurationPanel />,
      },
      ...extraTabs,
    ],
    [t, extraTabs],
  );

  return (
    <Sidebar
      side="right"
      className="absolute z-[40] h-full group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1.2)] pt-0 [&>[data-sidebar=sidebar]]:sticky [&>[data-sidebar=sidebar]]:top-9 [&>[data-sidebar=sidebar]]:h-fit"
      variant="inset"
    >
      <SidebarContent className="w-full border-b border-secondary bg-background relative h-full overflow-hidden">
        <div className="px-2 py-2">
          <Tabs
            defaultValue={allTabs[0].value}
            value={selectedTab}
            onValueChange={(value) => setSidebarTab(value as any)}
          >
            <SelectBlockListener />
            <TabsList className="w-full justify-between sticky top-0 z-10 flex-wrap h-auto items-center">
              {allTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 flex-1"
                >
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              {allTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
