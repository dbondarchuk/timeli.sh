import { createContext, useContext } from "react";

export const ImageContext = createContext<{
  allowResize: boolean;
}>({
  allowResize: true,
});

export const ImageProvider = ({
  children,
  allowResize,
}: {
  children: React.ReactNode;
  allowResize: boolean;
}) => {
  return (
    <ImageContext.Provider value={{ allowResize }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useAllowImageResize = () => {
  const context = useContext(ImageContext);
  return context?.allowResize ?? true;
};
