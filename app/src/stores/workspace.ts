import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// The Organisation a user is currently acting as. `null` is only a
// transient "not yet resolved" state (right after login, before the
// auto-select effect in DashboardLayout picks one) — every user always
// belongs to at least one Organisation. Every list/detail request for
// owner-scoped domains (posts, projects, style profiles, documents, social
// channel connections, automations) passes `organisation_id` derived from
// this store.
interface WorkspaceState {
  active_organisation_id: string | null;
  active_organisation_name: string | null;
  setActiveWorkspace: (organisation: { id: string; name: string } | null) => void;
}

const STORE_KEY = "workspace";

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      (set) => ({
        active_organisation_id: null,
        active_organisation_name: null,
        setActiveWorkspace: (organisation) =>
          set({
            active_organisation_id: organisation?.id ?? null,
            active_organisation_name: organisation?.name ?? null,
          }),
      }),
      { name: STORE_KEY },
    ),
  ),
);

export const getWorkspaceStoreState = () => useWorkspaceStore.getState();
