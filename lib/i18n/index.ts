export type { Lang, Dict } from "./types";
export { pl } from "./pl";
export { en } from "./en";

import { pl } from "./pl";
import { en } from "./en";

export const dict = { pl, en } as const;
