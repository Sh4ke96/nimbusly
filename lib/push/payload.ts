import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

export type WebPushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export function buildWebPushPayload(params: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): WebPushPayload {
  return {
    title: params.title,
    body: params.body,
    url: params.url ?? PUSH_NOTIFICATION_DEFAULT_URL,
    ...(params.tag ? { tag: params.tag } : {}),
  };
}
