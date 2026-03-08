export const getFileName = (
  appId: string,
  purchasedGiftCardId: string,
  type: "gift-card" | "invoice",
  format: "pdf" | "png",
) => {
  return `${appId}/${purchasedGiftCardId}/${type}.${format}`;
};
