"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

export const LightboxContext = createContext<{
  registerImage: (url: string, alt?: string) => string;
  unregisterImage: (id: string) => void;
  openLightbox: (id: string) => void;
}>({
  registerImage: () => "",
  unregisterImage: () => {},
  openLightbox: () => {},
});

export const LightboxInternalContext = createContext<{
  isOpen: boolean;
  openId: string | null;
  onClose: () => void;
  images: { id: string; url: string; alt?: string }[];
}>({
  isOpen: false,
  openId: null,
  onClose: () => {},
  images: [],
});

export const LightboxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [images, setImages] = useState<
    { id: string; url: string; alt?: string }[]
  >([]);

  const registerImage = useCallback(
    (url: string, alt?: string) => {
      const id = uuidv4();
      setImages((prev) => [...prev, { id, url, alt }]);
      return id;
    },
    [setImages],
  );

  const unregisterImage = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((image) => image.id !== id));
    },
    [setImages],
  );

  const openLightbox = useCallback(
    (id: string) => {
      setOpenId(id);
    },
    [setOpenId],
  );

  const onClose = useCallback(() => {
    setOpenId(null);
  }, [setOpenId]);

  const context = useMemo(
    () => ({ registerImage, unregisterImage, openLightbox }),
    [registerImage, unregisterImage, openLightbox],
  );

  const internalContext = useMemo(
    () => ({ isOpen: !!openId, openId, onClose, images }),
    [openId, images, onClose],
  );

  return (
    <LightboxContext.Provider value={context}>
      <LightboxInternalContext.Provider value={internalContext}>
        {children}
      </LightboxInternalContext.Provider>
    </LightboxContext.Provider>
  );
};

export const useLightbox = () => {
  return useContext(LightboxContext);
};

export const useLightboxImage = () => {
  const context = useContext(LightboxContext);
  if (!context) {
    return null;
  }

  return context;
};
