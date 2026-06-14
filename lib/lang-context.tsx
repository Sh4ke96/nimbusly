"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { updatePreferredLang } from "@/app/(app)/account/lang-actions";
import { LANG, LANG_COOKIE, type Lang } from "@/lib/constants/lang";
import { dict } from "./i18n";

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
  const [lang, setLangState] = useState<Lang>(initialLang);

  function setLang(newLang: Lang) {
    document.cookie = `${LANG_COOKIE}=${newLang};path=/;max-age=31536000;SameSite=Lax`;
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
