import { parseAsInteger, parseAsNumberLiteral, parseAsString, parseAsStringLiteral } from "nuqs";

export const SEARCH_FIELDS = ["email", "name"] as const;
export const SORT_FIELDS = ["createdAt", "name", "email", "role"] as const;
export const USER_FILTERS = ["admin", "user", "banned"] as const;
export const PAGE_SIZES = [10, 20, 50, 100] as const;

export type SortField = (typeof SORT_FIELDS)[number];

/**
 * Table state lives in the URL, so a reload, a shared link or the back button
 * restores the same view. Defaults are omitted from the URL (`clearOnDefault`).
 *
 * The admin API takes a single filter, so `filter` is one of role or banned, not both.
 */
export const usersSearchParams = {
  q: parseAsString.withDefault(""),
  in: parseAsStringLiteral(SEARCH_FIELDS).withDefault("email"),
  filter: parseAsStringLiteral(USER_FILTERS),
  sort: parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
  dir: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  size: parseAsNumberLiteral(PAGE_SIZES).withDefault(10),
};

export const usersSearchOptions = { history: "push", clearOnDefault: true } as const;
