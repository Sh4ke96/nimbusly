"use client";

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { updatePreferredLang } from "@/app/(app)/account/lang-actions";
import { LANG, LANG_COOKIE, LANGS, type Lang } from "@/lib/constants/lang";
import { dict } from "./i18n";

function readLangCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value && LANGS.includes(value as Lang) ? (value as Lang) : null;
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: LANG.PL,
  setLang: () => {},
});

export function LangProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof document === "undefined") return initialLang;
    return readLangCookie() ?? initialLang;
  });

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(newLang: Lang) {
    document.cookie = `${LANG_COOKIE}=${newLang};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = newLang;
    setLangState(newLang);
    void updatePreferredLang(newLang);
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  const { lang } = useContext(LangContext);
  return dict[lang];
}

export function useLang() {
  return useContext(LangContext);
}
