export const LANG = {
  PL: "pl",
  EN: "en",
} as const;

export type Lang = (typeof LANG)[keyof typeof LANG];

export const LANGS = Object.values(LANG) as Lang[];

export const LANG_COOKIE = "nimbusly-lang";

export const LOCALE_BY_LANG = {
  [LANG.PL]: "pl-PL",
  [LANG.EN]: "en-US",
} as const satisfies Record<Lang, string>;
