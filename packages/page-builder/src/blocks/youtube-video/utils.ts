// Extracts a YouTube video ID from any valid YouTube URL or embed code
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;

  // Remove iframe/embed code wrappers
  const iframeMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeMatch) input = iframeMatch[1];

  // Patterns for various YouTube URL formats
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    // https://www.youtube-nocookie.com/embed/VIDEO_ID
    /youtube-nocookie\.com\/embed\/([\w-]{11})/,
    // https://m.youtube.com/watch?v=VIDEO_ID
    /m\.youtube\.com\/watch\?.*v=([\w-]{11})/,
    // https://youtu.be/VIDEO_ID (explicit youtu.be pattern)
    /youtu\.be\/([\w-]{11})/,
    // https://youtu.be/VIDEO_ID?t=123s (with timestamp)
    /youtu\.be\/([\w-]{11})(?:\?.*)?/,
    // Fallback: just 11-char ID
    /^([\w-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
}
