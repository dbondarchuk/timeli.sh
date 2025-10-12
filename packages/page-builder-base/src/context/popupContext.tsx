"use client";

import { createContext, useContext, useEffect } from "react";
import { useReaderContext } from "./readerContext";

type PopupContextType = {
  id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const PopupContext = createContext<PopupContextType>({
  isOpen: false,
  id: "",
  setIsOpen: () => {},
});

export const useCurrentPopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    return null;
  }

  return context;
};

export const PopupProvider = ({
  children,
  id,
  isOpen,
  setIsOpen,
}: PopupContextType & {
  children: React.ReactNode;
}) => {
  const readerContext = useReaderContext();
  useEffect(() => {
    const popup = { id, isOpen, setIsOpen };
    if (readerContext) {
      readerContext.popup.unregisterPopup(id);
      readerContext.popup.registerPopup(popup);
    }
  }, [id, isOpen, setIsOpen, readerContext]);

  return (
    <PopupContext.Provider value={{ id, isOpen, setIsOpen }}>
      {children}
    </PopupContext.Provider>
  );
};
