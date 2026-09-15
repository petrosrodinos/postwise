import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostStatusFilterOptions } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { PostTypeFilterOptions } from "@/config/constants/dropdowns/posts/post-type-filter.options";
import { PostSourceFilterOptions } from "@/config/constants/dropdowns/posts/post-source-filter.options";
import { useProjects } from "@/features/projects/hooks/use-projects";
import type { PostSource, PostStatus, PostType } from "@/features/posts/interfaces/posts.interfaces";

export interface PostsFilterState {
  search: string;
  status: PostStatus | "all";
  type: PostType | "all";
  source: PostSource | "all";
  project_id: string | "all";
}

interface PostsFiltersProps {
  filters: PostsFilterState;
  onChange: (filters: PostsFilterState) => void;
}

export function PostsFilters({ filters, onChange }: PostsFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const { data: projectsPage } = useProjects({ limit: 100 });
  const projects = projectsPage?.data ?? [];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) onChange({ ...filters, search: searchInput });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const projectOptions = [{ label: "All projects", value: "all" }, ...projects.map((project) => ({ label: project.title, value: project.id }))];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search posts…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
      </div>

      <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value as PostsFilterState["status"] })}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {PostStatusFilterOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(value) => onChange({ ...filters, type: value as PostsFilterState["type"] })}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {PostTypeFilterOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source} onValueChange={(value) => onChange({ ...filters, source: value as PostsFilterState["source"] })}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {PostSourceFilterOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.project_id} onValueChange={(value) => onChange({ ...filters, project_id: value })}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          {projectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
