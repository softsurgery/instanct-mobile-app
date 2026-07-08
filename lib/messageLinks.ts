import { ResponseMessageLinkDto } from "@/types";

export type ExtractedMessageLink = Pick<
  ResponseMessageLinkDto,
  "url" | "startOffset" | "endOffset" | "order"
>;

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+/gi;
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:)\]]+$/;

export const extractMessageLinks = (
  content?: string | null,
): ExtractedMessageLink[] => {
  if (!content?.trim()) {
    return [];
  }

  const links: ExtractedMessageLink[] = [];
  let match: RegExpExecArray | null;

  while ((match = URL_REGEX.exec(content)) !== null) {
    let url = match[0];
    let endOffset = match.index + url.length;

    const trailingPunctuation = url.match(TRAILING_PUNCTUATION_REGEX);
    if (trailingPunctuation) {
      url = url.slice(0, -trailingPunctuation[0].length);
      endOffset -= trailingPunctuation[0].length;
    }

    if (!url) {
      continue;
    }

    links.push({
      url,
      startOffset: match.index,
      endOffset,
      order: links.length,
    });
  }

  return links;
};

export const normalizeMessageLinkUrl = (url: string) => {
  if (/^www\./i.test(url)) {
    return `https://${url}`;
  }

  return url;
};

export const resolveMessageLinks = (
  content?: string | null,
  links?: ResponseMessageLinkDto[],
) => {
  if (links?.length) {
    return [...links].sort((a, b) => a.startOffset - b.startOffset);
  }

  return extractMessageLinks(content);
};

export const messageHasLinks = (message: {
  content?: string | null;
  links?: ResponseMessageLinkDto[];
}) =>
  (message.links?.length ?? 0) > 0 ||
  extractMessageLinks(message.content).length > 0;

export const getMessageLinksForDisplay = (
  message: {
    content?: string | null;
    links?: ResponseMessageLinkDto[];
  },
) => resolveMessageLinks(message.content, message.links);
