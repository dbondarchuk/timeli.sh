"use client";

import { createContext, useContext, useMemo, useRef } from "react";

type Popup = {
  id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

type ReaderPopupContextType = {
  openPopup: (popupId: string) => void;
  closePopup: (popupId: string) => void;
  isPopupOpen: (popupId: string) => boolean;
  registerPopup: (popup: Popup) => void;
  unregisterPopup: (popupId: string) => void;
};

type ReaderContextType = {
  popup: ReaderPopupContextType;
};

export const ReaderContext = createContext<ReaderContextType>({
  popup: {
    openPopup: () => {},
    closePopup: () => {},
    isPopupOpen: () => false,
    registerPopup: () => {},
    unregisterPopup: () => {},
  },
});

export const useReaderContext = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    return null;
  }

  return context;
};

export const useReaderPopupContext = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    return null;
  }
  return context.popup;
};

const usePopupContext = () => {
  const popups = useRef<Map<string, Popup>>(new Map());

  const openPopup = (popupId: string) => {
    const popup = popups.current.get(popupId);
    if (popup) {
      popup.setIsOpen(true);
    }
  };

  const closePopup = (popupId: string) => {
    const popup = popups.current.get(popupId);
    if (popup) {
      popup.setIsOpen(false);
    }
  };

  const isPopupOpen = (popupId: string) =>
    popups.current.get(popupId)?.isOpen ?? false;

  const registerPopup = (popup: Popup) => {
    popups.current.set(popup.id, popup);
  };

  const unregisterPopup = (popupId: string) => {
    popups.current.delete(popupId);
  };

  const popup = useMemo(
    () => ({
      openPopup,
      closePopup,
      isPopupOpen,
      registerPopup,
      unregisterPopup,
    }),
    [popups],
  );

  return popup;
};

export const ReaderProvider = ({ children }: { children: React.ReactNode }) => {
  const popup = usePopupContext();

  return (
    <ReaderContext.Provider value={{ popup }}>
      {children}
    </ReaderContext.Provider>
  );
};
