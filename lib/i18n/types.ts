export type Lang = "pl" | "en";

export type Dict = {
  nav: {
    features: string;
    featuresSlug: string;
    howItWorks: string;
    howItWorksSlug: string;
    forFamily: string;
    forFamilySlug: string;
    login: string;
    getStarted: string;
    dashboard: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    desc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    socialProofCount: string;
    socialProofLabel: string;
    rating: string;
  };
  chips: {
    budget: string;
    shopping: string;
    gifts: string;
    birthdays: string;
  };
  features: {
    heading: string;
    subheading: string;
    items: { title: string; desc: string }[];
  };
  steps: {
    heading: string;
    items: { step: string; title: string; desc: string }[];
  };
  cta: {
    heading: string;
    desc: string;
    btn: string;
    perks: string[];
  };
  footer: {
    rights: string;
    madeWith: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitBtn: string;
    submitting: string;
    noAccount: string;
    signUp: string;
    backHome: string;
    errorRequired: string;
    errorInvalid: string;
    errorNotConfirmed: string;
    errorGeneric: string;
  };
  register: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    submitBtn: string;
    submitting: string;
    hasAccount: string;
    signIn: string;
    successTitle: string;
    successMessage: string;
    backHome: string;
    errorRequired: string;
    errorPasswordLength: string;
    errorPasswordMatch: string;
    errorEmailTaken: string;
    errorGeneric: string;
  };
  dashboard: {
    greeting: string;
    loggedAs: string;
    modules: string;
    comingSoon: string;
    comingSoonDesc: string;
    logout: string;
    moduleLabels: {
      budget: string;
      shopping: string;
      gifts: string;
      birthdays: string;
      calendar: string;
      family: string;
    };
    moduleDescs: {
      budget: string;
      shopping: string;
      gifts: string;
      birthdays: string;
      calendar: string;
      family: string;
    };
  };
};
