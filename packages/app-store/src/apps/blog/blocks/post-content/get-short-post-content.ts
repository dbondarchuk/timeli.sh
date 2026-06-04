type ShortPostContentOptions = {
  showShort: boolean;
  maxParagraphs: number;
  showOnlyTextParagraphs: boolean;
};

export const getShortPostContent = (
  postContent: unknown,
  options: ShortPostContentOptions,
): unknown => {
  if (!options.showShort || !Array.isArray(postContent)) {
    return postContent;
  }

  let blocks = postContent;
  if (options.showOnlyTextParagraphs) {
    blocks = blocks.filter(
      (node) =>
        node &&
        typeof node === "object" &&
        "type" in node &&
        (node as { type?: string }).type === "p",
    );
  }

  const max = Math.max(1, options.maxParagraphs);
  return blocks.slice(0, max);
};
