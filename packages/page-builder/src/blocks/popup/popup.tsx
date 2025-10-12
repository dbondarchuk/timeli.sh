"use client";

import { usePortalContext } from "@vivid/builder";
import { PopupProvider } from "@vivid/page-builder-base";
import { Dialog, DialogContent } from "@vivid/ui";
import { DateTime } from "luxon";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { overlayType, showPopupType } from "./schema";

const shownCookieValue = "shown";

export const Popup: React.FC<{
  blockId: string;
  show: (typeof showPopupType)[number];
  overlay: (typeof overlayType)[number];
  noClose?: boolean;
  isEditor?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}> = ({
  blockId,
  show,
  overlay,
  noClose,
  isEditor,
  id,
  className,
  children,
}) => {
  const popupId = id || blockId;
  const COOKIE_NAME = `popup-shown-${popupId}`;

  const [cookies, setCookies] = useCookies<
    typeof COOKIE_NAME,
    Record<string, string | undefined>
  >([COOKIE_NAME]);

  const { body } = usePortalContext();

  const [isOpen, setIsOpen] = useState(
    show === "always" ||
      (isEditor && show !== "on-click") ||
      (show === "one-time" && cookies[COOKIE_NAME] !== shownCookieValue),
  );

  const onOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);

    if (!isOpen) return;

    setCookies(COOKIE_NAME, shownCookieValue, {
      expires: DateTime.now().plus({ years: 1 }).toJSDate(),
    });
  };

  return (
    <PopupProvider id={popupId} isOpen={isOpen} setIsOpen={onOpenChange}>
      <Dialog open={isOpen} modal onOpenChange={onOpenChange}>
        <DialogContent
          container={body}
          id={id}
          className={className}
          overlayVariant={overlay}
          noClose={noClose}
        >
          {children}
        </DialogContent>
      </Dialog>
    </PopupProvider>
  );
};
