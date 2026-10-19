import { SearchIcon, XIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { debounce } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  SEARCH_FIELDS,
  USER_FILTERS,
  usersSearchOptions,
  usersSearchParams,
} from "./users-search-params";

const FILTER_LABELS = { admin: "Admins", user: "Users", banned: "Banned" } as const;
const ALL = "all";

export function UsersToolbar() {
  const [params, setParams] = useQueryStates(usersSearchParams, usersSearchOptions);
  const dirty = params.q !== "" || params.filter !== null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            className="pl-8"
            placeholder={`Search by ${params.in}…`}
            aria-label="Search users"
            value={params.q}
            onChange={(e) =>
              // The input updates at once; the URL write is debounced and replaces the entry.
              void setParams(
                { q: e.target.value, page: 1 },
                { history: "replace", limitUrlUpdates: debounce(300) },
              )
            }
          />
        </div>
        <Select
          value={params.in}
          onValueChange={(value) => value && void setParams({ in: value, page: 1 })}
        >
          <SelectTrigger aria-label="Search field">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_FIELDS.map((field) => (
              <SelectItem key={field} value={field}>
                {field === "email" ? "Email" : "Name"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={params.filter ?? ALL}
          onValueChange={(value) =>
            void setParams({
              filter: USER_FILTERS.find((filter) => filter === value) ?? null,
              page: 1,
            })
          }
        >
          <SelectTrigger aria-label="Filter users">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All users</SelectItem>
            {USER_FILTERS.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {FILTER_LABELS[filter]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dirty && (
          <Button
            variant="ghost"
            onClick={() => void setParams({ q: null, filter: null, page: null })}
          >
            Reset
            <XIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
