"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import ProductPagination from "@/components/products/ProductPagination";
import { Badge, MetricTile, Toast } from "@/components/ui";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const pageSize = 10;

type AdminSection = "users" | "roles";
type Role = { id: number; name: string; description: string; usersCount: number; updatedAt?: string };
type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  role: string;
  roles: string[];
  status: string;
  suspensionMessage: string;
  suspensionStartsAt?: string | null;
  suspendedUntil?: string | null;
  isCurrentUser: boolean;
  joinedAt?: string;
};
type UserStats = { total: number; active: number; suspended: number; newThisMonth: number };
type UserResponse = {
  users: User[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: UserStats;
};
type RoleResponse = { roles: Role[]; canManageRoles: boolean };
type RestrictionFieldErrors = {
  action?: string;
  message?: string;
  startsAt?: string;
  until?: string;
};

async function request<T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const token = window.localStorage.getItem("marketplace-token");
  if (!token) throw new Error("Sign in with a superadmin account to manage access.");

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data as T;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function toLocalDateTimeInput(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function isSuperadminUser(user: User) {
  return user.roles.some((role) => role.toLowerCase() === "superadmin") || user.role.toLowerCase() === "superadmin";
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-heading">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg px-2 py-1 text-xl text-muted hover:bg-surface-muted">×</button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5 text-xs font-medium text-body">{label}{children}</label>;
}

const inputClass = "h-10 w-full rounded-lg border border-border-control bg-white px-3 text-sm text-body outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";

export default function AdminAccessPage({ section }: { section: AdminSection }) {
  const isUsers = section === "users";
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, suspended: 0, newThisMonth: 0 });
  const [page, setPage] = useState(1);
  const [rolePage, setRolePage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [userDialog, setUserDialog] = useState<"create" | User | null>(null);
  const [roleDialog, setRoleDialog] = useState<Role | "create" | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: "user"; item: User } | { type: "role"; item: Role } | null>(null);
  const [userStatusDialog, setUserStatusDialog] = useState<User | null>(null);
  const [userDeleteDialog, setUserDeleteDialog] = useState<User | null>(null);
  const [roleDeleteDialog, setRoleDeleteDialog] = useState<Role | null>(null);
  const [detailDialog, setDetailDialog] = useState<{ type: "user"; item: User } | { type: "role"; item: Role } | null>(null);
  const [restrictionDuration, setRestrictionDuration] = useState<"scheduled" | "permanent">("scheduled");
  const [restrictionStartMode, setRestrictionStartMode] = useState<"immediate" | "scheduled">("immediate");
  const [editingRestriction, setEditingRestriction] = useState(false);
  const [restrictionFieldErrors, setRestrictionFieldErrors] = useState<RestrictionFieldErrors>({});

  const loadRoles = useCallback(async (signal?: AbortSignal) => {
    const data = await request<RoleResponse>("/admin/roles", {}, signal);
    setRoles(data.roles);
    setCanManageRoles(data.canManageRoles);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const rolesRequest = request<RoleResponse>("/admin/roles", {}, controller.signal)
      .then((data) => {
        setRoles(data.roles);
        setCanManageRoles(data.canManageRoles);
      })
      .catch((loadError: Error) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      });
    if (!isUsers) {
      rolesRequest.finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
      return () => controller.abort();
    }

    const query = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      search,
      status: statusFilter === "All" ? "" : statusFilter.toLowerCase(),
      roleId: roleFilter === "All" ? "" : roleFilter,
    });
    request<UserResponse>(`/admin/users?${query}`, {}, controller.signal)
      .then((data) => {
        setUsers(data.users);
        setStats(data.stats);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      })
      .catch((loadError: Error) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [isUsers, loadRoles, page, roleFilter, search, statusFilter]);

  function updateFilters(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
    setLoading(true);
    setError("");
    setNotice("");
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setSaving(true);
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (userDialog === "create") {
        await request("/admin/users", { method: "POST", body: JSON.stringify(values) });
        setNotice("User created successfully.");
      } else if (userDialog) {
        await request(`/admin/users/${userDialog.id}`, { method: "PATCH", body: JSON.stringify(values) });
        setNotice("User updated successfully.");
      }
      setUserDialog(null);
      const nextPage = userDialog === "create" ? 1 : page;
      setPage(nextPage);
      await loadCurrent(nextPage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save user.");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  async function loadCurrent(requestedPage = page) {
    const query = new URLSearchParams({
      page: String(requestedPage),
      limit: String(pageSize),
      search,
      status: statusFilter === "All" ? "" : statusFilter.toLowerCase(),
      roleId: roleFilter === "All" ? "" : roleFilter,
    });
    try {
      const data = await request<UserResponse>(`/admin/users?${query}`);
      setUsers(data.users);
      setStats(data.stats);
      setTotal(data.pagination.total);
      setPages(data.pagination.pages);
      await loadRoles();
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (roleDialog === "create") {
        await request("/admin/roles", { method: "POST", body: JSON.stringify(values) });
        setNotice("Role created successfully.");
      } else if (roleDialog) {
        await request(`/admin/roles/${roleDialog.id}`, { method: "PATCH", body: JSON.stringify(values) });
        setNotice("Role updated successfully.");
      }
      setRoleDialog(null);
      await loadRoles();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save role.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRole(role: Role) {
    setError("");
    setNotice("");
    try {
      await request(`/admin/roles/${role.id}`, { method: "DELETE" });
      setNotice("Role deleted successfully.");
      setRolePage(1);
      setRoleDeleteDialog(null);
      await loadRoles();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete role.");
    }
  }

  async function changeUserStatus(
    user: User,
    restriction?: {
      status: "suspended" | "banned";
      message: string;
      startsAt?: string;
      startImmediately?: boolean;
      until: string | null;
    },
  ) {
    const isEnabling = !restriction;
    const status = restriction?.status || "active";
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(restriction
          ? {
              status,
              suspensionMessage: restriction.message,
              suspensionStartsAt: restriction.startsAt,
              startImmediately: restriction.startImmediately,
              suspendedUntil: restriction.until,
            }
          : { status }),
      });
      setNotice(isEnabling ? "User enabled successfully." : status === "banned" ? "User banned successfully." : "User disabled successfully.");
      setUserStatusDialog(null);
      await loadCurrent();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update user status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUserStatusSubmit(event: FormEvent<HTMLFormElement>, user: User) {
    event.preventDefault();
    if (user.status !== "active" && !editingRestriction) {
      await changeUserStatus(user);
      return;
    }
    const values = new FormData(event.currentTarget);
    const status = String(values.get("restrictionStatus")) as "suspended" | "banned";
    const message = String(values.get("suspensionMessage") || "").trim();
    const localStartsAt = String(values.get("suspensionStartsAt") || "");
    const localUntil = String(values.get("suspendedUntil") || "");
    const existingStart = editingRestriction && user.suspensionStartsAt
      ? new Date(user.suspensionStartsAt)
      : null;
    const keepsExistingStart = Boolean(existingStart && !Number.isNaN(existingStart.getTime()));
    const startsAt = restrictionStartMode === "scheduled"
      ? new Date(localStartsAt)
      : keepsExistingStart
        ? existingStart
        : new Date();
    const until = localUntil ? new Date(localUntil) : null;
    const fieldErrors: RestrictionFieldErrors = {};
    if (!["suspended", "banned"].includes(status)) {
      fieldErrors.action = "Choose whether to disable or ban this account.";
    }
    if (!message) fieldErrors.message = "Enter a reason for this restriction.";
    if (restrictionStartMode === "scheduled") {
      if (!localStartsAt || Number.isNaN(startsAt.getTime())) {
        fieldErrors.startsAt = "Enter a valid start date and time.";
      } else if (startsAt <= new Date()) {
        fieldErrors.startsAt = "Choose a future start date and time.";
      }
    }
    if (restrictionDuration === "scheduled") {
      if (!localUntil || !until || Number.isNaN(until.getTime())) {
        fieldErrors.until = "Enter a valid end date and time.";
      } else if (until <= startsAt) {
        fieldErrors.until = "The end date and time must be after the start.";
      } else if (until <= new Date()) {
        fieldErrors.until = "Choose a future end date and time.";
      }
    }
    setRestrictionFieldErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }
    await changeUserStatus(user, {
      status,
      message,
      ...(restrictionStartMode === "scheduled" || keepsExistingStart
        ? { startsAt: startsAt.toISOString() }
        : { startImmediately: true }),
      until: restrictionDuration === "scheduled" ? until?.toISOString() || null : null,
    });
  }

  async function deleteUser(user: User) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request(`/admin/users/${user.id}`, { method: "DELETE" });
      setNotice("User account deleted successfully.");
      setUserDeleteDialog(null);
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await loadCurrent(nextPage);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete user account.");
    } finally {
      setSaving(false);
    }
  }

  const title = isUsers ? "Users" : "Roles & Permissions";
  const description = isUsers
    ? "Manage marketplace users, roles, and account status."
    : "Control access to marketplace features and settings.";
  const filteredRoles = roles.filter((role) =>
    `${role.name} ${role.description}`.toLowerCase().includes(roleSearch.toLowerCase()),
  );
  const rolePages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const visibleRoles = filteredRoles.slice((rolePage - 1) * pageSize, rolePage * pageSize);
  const assignableRoles = roles.filter((role) =>
    role.name.toLowerCase() !== "superadmin" && (canManageRoles || role.name.toLowerCase() !== "admin"),
  );
  const existingRestrictionStart = editingRestriction && userStatusDialog?.suspensionStartsAt
    ? new Date(userStatusDialog.suspensionStartsAt)
    : null;
  const existingRestrictionStartsInFuture = Boolean(
    existingRestrictionStart &&
    !Number.isNaN(existingRestrictionStart.getTime()) &&
    existingRestrictionStart > new Date(),
  );
  const restrictionStartDefault = existingRestrictionStartsInFuture
    ? existingRestrictionStart
    : new Date(Date.now() + 5 * 60 * 1000);
  const restrictionEndDefault = editingRestriction && userStatusDialog?.suspendedUntil
    ? new Date(userStatusDialog.suspendedUntil)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Administration</p>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {canManageRoles && <button
          type="button"
          onClick={() => isUsers ? setUserDialog("create") : setRoleDialog("create")}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
        >
          <PublicIcon name="add" className="h-3.5 w-3.5" /> Add {isUsers ? "User" : "Role"}
        </button>}
      </header>

      {isUsers && <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Users" value={stats.total.toLocaleString()} change="All accounts" icon={<PublicIcon name="user" className="h-5 w-5" />} />
        <MetricTile label="Active Users" value={stats.active.toLocaleString()} change="Currently active" icon={<PublicIcon name="user" className="h-5 w-5" />} />
        <MetricTile label="Restricted Users" value={stats.suspended.toLocaleString()} change="Disabled or banned accounts" icon={<PublicIcon name="shield-minus" className="h-5 w-5" />} />
        <MetricTile label="New This Month" value={stats.newThisMonth.toLocaleString()} change="Joined this month" icon={<PublicIcon name="user" className="h-5 w-5" />} />
      </div>}

      {error && <Toast variant="error" message={error} onClose={() => setError("")} className="z-[120]" />}
      {notice && <Toast variant="success" message={notice} onClose={() => setNotice("")} className="z-[120]" />}

      <section className={`${isUsers ? "mt-5" : "mt-6"} overflow-hidden rounded-2xl border border-border bg-white shadow-sm`}>
        <div className="flex flex-col gap-2 border-b border-divider px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <label className="relative min-w-[12rem] flex-1 sm:max-w-[18rem]">
            <span className="sr-only">Search {isUsers ? "users" : "roles"}</span>
            <PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" />
            <input
              value={isUsers ? search : roleSearch}
              onChange={(event) => {
                if (isUsers) {
                  updateFilters(setSearch, event.target.value);
                } else {
                  setRoleSearch(event.target.value);
                  setRolePage(1);
                  setError("");
                  setNotice("");
                }
              }}
              placeholder={`Search ${isUsers ? "users" : "roles"}...`}
              className="h-9 w-full rounded-lg border border-border-control bg-white pl-9 pr-3 text-xs text-body outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
          </label>
          {isUsers && <>
            <select aria-label="Filter by role" value={roleFilter} onChange={(event) => updateFilters(setRoleFilter, event.target.value)} className={`${inputClass} select-chevron h-9 bg-white px-3 pr-8 text-xs sm:w-36`}>
              <option value="All">All Roles</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => updateFilters(setStatusFilter, event.target.value)} className={`${inputClass} select-chevron h-9 bg-white px-3 pr-8 text-xs sm:w-36`}>
              <option value="All">All Status</option>
              {["Active", "Inactive", "Suspended", "Banned"].map((status) => <option key={status}>{status}</option>)}
            </select>
          </>}
        </div>

        <div className="overflow-x-auto">
          {isUsers ? <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-[#fcfcfe] text-[10px] uppercase tracking-[0.08em] text-muted"><tr>
              {["Full Name / Username", "Email", "Role", "Status", "Joined Date", "Actions"].map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}
            </tr></thead>
            <tbody>{users.map((user) => <tr key={user.id} className="border-t border-divider text-body odd:bg-white even:bg-[#fffaf7] transition hover:bg-surface-hover">
              <td className="px-5 py-2.5">
                <p className="font-medium text-body-strong">{user.name || "Unnamed user"}</p>
                <p className="mt-0.5 text-[10px] text-muted">{user.username ? `@${user.username}` : "No username"}</p>
              </td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{user.email}</td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{user.role || "—"}</td>
              <td className="px-5 py-2.5"><Badge tone={user.status === "active" ? "success" : user.status === "suspended" || user.status === "banned" ? "danger" : "warning"}>{["suspended", "banned"].includes(user.status) && user.suspensionStartsAt && new Date(user.suspensionStartsAt) > new Date() ? "scheduled" : user.status}</Badge></td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{formatDate(user.joinedAt)}</td>
              <td className="px-5 py-2.5"><button type="button" onClick={() => setActionDialog({ type: "user", item: user })} aria-label={`Actions for ${user.name || user.username || "user"}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border-control text-muted transition hover:border-primary hover:bg-accent-light hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-4 w-4" /></button></td>
            </tr>)}</tbody>
          </table> : <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-[#fcfcfe] text-[10px] uppercase tracking-[0.08em] text-muted"><tr>
              {["Role Name", "Description", "Users", "Last Updated", "Actions"].map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}
            </tr></thead>
            <tbody>{visibleRoles.map((role) => <tr key={role.id} className="border-t border-divider text-body odd:bg-white even:bg-[#fffaf7] transition hover:bg-surface-hover">
              <td className="px-5 py-2.5 font-medium text-body-strong">{role.name}</td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{role.description || "—"}</td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{role.usersCount.toLocaleString()}</td>
              <td className="px-5 py-2.5 text-[10px] text-muted">{formatDate(role.updatedAt)}</td>
              <td className="px-5 py-2.5"><button type="button" onClick={() => setActionDialog({ type: "role", item: role })} aria-label={`Actions for ${role.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border-control text-muted transition hover:border-primary hover:bg-accent-light hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-4 w-4" /></button></td>
            </tr>)}</tbody>
          </table>}
          {!loading && (isUsers ? users.length === 0 : filteredRoles.length === 0) && <p className="px-6 py-12 text-center text-sm text-muted">No matching records.</p>}
          {loading && <p className="px-6 py-12 text-center text-sm text-muted">Loading {title.toLowerCase()}...</p>}
        </div>
        <ProductPagination
          count={isUsers ? users.length : visibleRoles.length}
          total={isUsers ? total : filteredRoles.length}
          page={isUsers ? page : rolePage}
          pages={isUsers ? pages : rolePages}
          itemLabel="records"
          onPageChange={(nextPage) => {
            if (isUsers) {
              setLoading(true);
              setError("");
              setPage(nextPage);
            } else {
              setRolePage(nextPage);
            }
          }}
        />
      </section>

      {actionDialog && <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActionDialog(null);
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label={`${actionDialog.type === "user" ? "User" : "Role"} actions`}
          className="w-full max-w-[30rem] rounded-2xl border border-border bg-white p-5 shadow-2xl sm:p-7"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-base font-bold leading-6 text-heading sm:text-lg">
              Actions: {actionDialog.type === "user"
                ? actionDialog.item.name || actionDialog.item.email
                : actionDialog.item.name}
            </h2>
            <button type="button" onClick={() => setActionDialog(null)} aria-label="Close dialog" className="shrink-0 rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-body">
              <PublicIcon name="x" className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setDetailDialog(actionDialog);
              setActionDialog(null);
            }}
            className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-border-control px-5 text-left text-sm font-medium text-body transition hover:bg-surface-hover"
          >
            <PublicIcon name="view" className="h-5 w-5 text-primary" />
            View Detail
          </button>
          {actionDialog.type === "role" && canManageRoles && actionDialog.item.name.toLowerCase() !== "superadmin" && <button
            type="button"
            onClick={() => {
              setRoleDialog(actionDialog.item);
              setActionDialog(null);
            }}
            className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-border-control px-5 text-left text-sm font-medium text-body transition hover:bg-surface-hover"
          >
            <PublicIcon name="edit" className="h-5 w-5 text-primary" />Edit Role
          </button>}
          {actionDialog.type === "user" && !isSuperadminUser(actionDialog.item) && (canManageRoles || actionDialog.item.role.toLowerCase() !== "admin") && <button
            type="button"
            onClick={() => {
              setUserDialog(actionDialog.item);
              setActionDialog(null);
            }}
            className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-border-control px-5 text-left text-sm font-medium text-body transition hover:bg-surface-hover"
          >
            <PublicIcon name="edit" className="h-5 w-5 text-primary" />Edit User
          </button>}
          {actionDialog.type === "user" && !isSuperadminUser(actionDialog.item) && (canManageRoles || actionDialog.item.role.toLowerCase() !== "admin") && ["active", "inactive", "suspended", "banned"].includes(actionDialog.item.status) && (
            <button
              type="button"
              onClick={() => {
                setEditingRestriction(false);
                setRestrictionStartMode("immediate");
                setRestrictionDuration("scheduled");
                setRestrictionFieldErrors({});
                setUserStatusDialog(actionDialog.item);
                setActionDialog(null);
              }}
              className={`flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border px-5 text-left text-sm font-medium transition ${actionDialog.item.status === "active" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-border-control text-body hover:bg-surface-hover"}`}
            >
              <PublicIcon name={actionDialog.item.status === "active" ? "shield-minus" : "shield-check"} className={`h-5 w-5 ${actionDialog.item.status === "active" ? "text-red-600" : "text-primary"}`} />
              {actionDialog.item.status === "active" ? "Disable User" : "Enable User"}
            </button>
          )}
          {actionDialog.type === "user" && !isSuperadminUser(actionDialog.item) && (canManageRoles || actionDialog.item.role.toLowerCase() !== "admin") && ["suspended", "banned"].includes(actionDialog.item.status) && (
            <button
              type="button"
              onClick={() => {
                setEditingRestriction(true);
                const existingStart = actionDialog.item.suspensionStartsAt
                  ? new Date(actionDialog.item.suspensionStartsAt)
                  : null;
                setRestrictionStartMode(existingStart && existingStart > new Date() ? "scheduled" : "immediate");
                setRestrictionDuration(actionDialog.item.suspendedUntil ? "scheduled" : "permanent");
                setRestrictionFieldErrors({});
                setUserStatusDialog(actionDialog.item);
                setActionDialog(null);
              }}
              className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-border-control px-5 text-left text-sm font-medium text-body transition hover:bg-surface-hover"
            >
              <PublicIcon name="edit" className="h-5 w-5 text-primary" />
              Edit Restriction
            </button>
          )}
          {actionDialog.type === "user" && canManageRoles && !actionDialog.item.isCurrentUser && !isSuperadminUser(actionDialog.item) && (
            <button
              type="button"
              onClick={() => {
                setUserDeleteDialog(actionDialog.item);
                setActionDialog(null);
              }}
              className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-red-200 px-5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <PublicIcon name="delete" className="h-5 w-5 text-red-600" />
              Delete User
            </button>
          )}
          {actionDialog.type === "role" && canManageRoles && actionDialog.item.name.toLowerCase() !== "superadmin" && (
            <button
              type="button"
              onClick={() => {
                setRoleDeleteDialog(actionDialog.item);
                setActionDialog(null);
              }}
              className="flex min-h-[3.6rem] w-full items-center gap-4 rounded-xl border border-red-200 px-5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <PublicIcon name="delete" className="h-5 w-5 text-red-600" />
              Delete Role
            </button>
          )}
          </div>
        </section>
      </div>}

      {detailDialog && <Dialog
        title={detailDialog.type === "user" ? "User details" : "Role details"}
        onClose={() => setDetailDialog(null)}
      >
        {detailDialog.type === "user" ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
            <dt className="text-muted">Full name</dt><dd className="font-medium text-body">{detailDialog.item.name || "—"}</dd>
            <dt className="text-muted">Username</dt><dd className="font-medium text-body">{detailDialog.item.username || "—"}</dd>
            <dt className="text-muted">Email</dt><dd className="break-all font-medium text-body">{detailDialog.item.email}</dd>
            <dt className="text-muted">Role</dt><dd className="font-medium text-body">{detailDialog.item.roles.join(", ") || detailDialog.item.role || "—"}</dd>
            <dt className="text-muted">Status</dt><dd className="font-medium capitalize text-body">{detailDialog.item.status}</dd>
            {["suspended", "banned"].includes(detailDialog.item.status) && <>
              <dt className="text-muted">Disable message</dt><dd className="font-medium text-body">{detailDialog.item.suspensionMessage || "—"}</dd>
              <dt className="text-muted">Starts</dt><dd className="font-medium text-body">{formatDateTime(detailDialog.item.suspensionStartsAt)}</dd>
              <dt className="text-muted">Ends</dt><dd className="font-medium text-body">{detailDialog.item.suspendedUntil ? formatDateTime(detailDialog.item.suspendedUntil) : "Permanently"}</dd>
            </>}
            <dt className="text-muted">Joined</dt><dd className="font-medium text-body">{formatDate(detailDialog.item.joinedAt)}</dd>
          </dl>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
            <dt className="text-muted">Role name</dt><dd className="font-medium text-body">{detailDialog.item.name}</dd>
            <dt className="text-muted">Description</dt><dd className="font-medium text-body">{detailDialog.item.description || "—"}</dd>
            <dt className="text-muted">Assigned users</dt><dd className="font-medium text-body">{detailDialog.item.usersCount.toLocaleString()}</dd>
            <dt className="text-muted">Last updated</dt><dd className="font-medium text-body">{formatDate(detailDialog.item.updatedAt)}</dd>
          </dl>
        )}
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setDetailDialog(null)} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Close</button>
        </div>
      </Dialog>}

      {userStatusDialog && <Dialog
        title={editingRestriction ? "Edit user restriction" : userStatusDialog.status === "active" ? "Disable or ban user?" : "Enable user?"}
        onClose={() => {
          setRestrictionFieldErrors({});
          setUserStatusDialog(null);
        }}
      >
        <form noValidate onSubmit={(event) => handleUserStatusSubmit(event, userStatusDialog)} className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            {userStatusDialog.status === "active" || editingRestriction
              ? editingRestriction
                ? "Update the restriction reason, status, or schedule."
                : "The restriction takes effect immediately. Choose when temporary access should be restored, or make it permanent."
              : "This user will be able to sign in again."}
            {" "}Continue for <span className="font-medium text-body">{userStatusDialog.name || userStatusDialog.email}</span>?
          </p>
          {(userStatusDialog.status === "active" || editingRestriction) && <>
            <Field label="Start">
              <select
                name="restrictionStartMode"
                value={restrictionStartMode}
                onChange={(event) => {
                  setRestrictionStartMode(event.target.value as "immediate" | "scheduled");
                  setRestrictionFieldErrors((current) => ({ ...current, startsAt: undefined }));
                }}
                className={inputClass}
              >
                <option value="immediate">Immediately</option>
                <option value="scheduled">Schedule for later</option>
              </select>
            </Field>
            {restrictionStartMode === "scheduled" && <Field label="Start date and time">
              <input
                name="suspensionStartsAt"
                type="datetime-local"
                required
                min={toLocalDateTimeInput(new Date())}
                defaultValue={toLocalDateTimeInput(restrictionStartDefault)}
                aria-invalid={Boolean(restrictionFieldErrors.startsAt)}
                aria-describedby={restrictionFieldErrors.startsAt ? "restriction-start-error" : undefined}
                onChange={() => setRestrictionFieldErrors((current) => ({ ...current, startsAt: undefined }))}
                className={inputClass}
              />
              {restrictionFieldErrors.startsAt && <span id="restriction-start-error" role="alert" className="block text-xs font-normal text-red-600">{restrictionFieldErrors.startsAt}</span>}
            </Field>}
            <Field label="Action">
              <select
                name="restrictionStatus"
                defaultValue={editingRestriction ? userStatusDialog.status : "suspended"}
                aria-invalid={Boolean(restrictionFieldErrors.action)}
                aria-describedby={restrictionFieldErrors.action ? "restriction-action-error" : undefined}
                onChange={() => setRestrictionFieldErrors((current) => ({ ...current, action: undefined }))}
                className={inputClass}
              >
                <option value="suspended">Disable account</option>
                <option value="banned">Ban account</option>
              </select>
              {restrictionFieldErrors.action && <span id="restriction-action-error" role="alert" className="block text-xs font-normal text-red-600">{restrictionFieldErrors.action}</span>}
            </Field>
            <Field label="Duration">
              <select
                name="restrictionDuration"
                value={restrictionDuration}
                onChange={(event) => setRestrictionDuration(event.target.value as "scheduled" | "permanent")}
                className={inputClass}
              >
                <option value="scheduled">Temporary until an end date</option>
                <option value="permanent">Permanent until manually enabled</option>
              </select>
            </Field>
            <Field label="Message shown to the user">
              <textarea
                name="suspensionMessage"
                required
                maxLength={1000}
                rows={3}
                defaultValue={editingRestriction ? userStatusDialog.suspensionMessage : ""}
                aria-invalid={Boolean(restrictionFieldErrors.message)}
                aria-describedby={restrictionFieldErrors.message ? "restriction-message-error" : undefined}
                onChange={() => setRestrictionFieldErrors((current) => ({ ...current, message: undefined }))}
                className={`${inputClass} h-auto py-2`}
                placeholder="Explain why this account is temporarily disabled."
              />
              {restrictionFieldErrors.message && <span id="restriction-message-error" role="alert" className="block text-xs font-normal text-red-600">{restrictionFieldErrors.message}</span>}
            </Field>
            <Field label="End date and time (scheduled restrictions only)">
              <input
                name="suspendedUntil"
                type="datetime-local"
                required={restrictionDuration === "scheduled"}
                disabled={restrictionDuration === "permanent"}
                min={toLocalDateTimeInput(new Date())}
                defaultValue={toLocalDateTimeInput(restrictionEndDefault)}
                aria-invalid={Boolean(restrictionFieldErrors.until)}
                aria-describedby={restrictionFieldErrors.until ? "restriction-end-error" : undefined}
                onChange={() => setRestrictionFieldErrors((current) => ({ ...current, until: undefined }))}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-muted`}
              />
              {restrictionFieldErrors.until && <span id="restriction-end-error" role="alert" className="block text-xs font-normal text-red-600">{restrictionFieldErrors.until}</span>}
            </Field>
          </>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => {
              setRestrictionFieldErrors({});
              setUserStatusDialog(null);
            }} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${userStatusDialog.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-hover"}`}
            >
              {saving ? "Saving..." : editingRestriction ? "Save restriction" : userStatusDialog.status === "active" ? "Apply restriction" : "Enable user"}
            </button>
          </div>
        </form>
      </Dialog>}

      {userDeleteDialog && <Dialog title="Delete user account?" onClose={() => setUserDeleteDialog(null)}>
        <p className="text-sm leading-6 text-muted">
          Permanently delete <span className="font-medium text-body">{userDeleteDialog.name || userDeleteDialog.email}</span>?
          {" "}This cannot be undone. Accounts with existing orders or licenses cannot be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setUserDeleteDialog(null)} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Cancel</button>
          <button
            type="button"
            disabled={saving}
            onClick={() => deleteUser(userDeleteDialog)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </Dialog>}

      {roleDeleteDialog && <Dialog title="Delete role?" onClose={() => setRoleDeleteDialog(null)}>
        <p className="text-sm leading-6 text-muted">
          Delete the <span className="font-medium text-body">{roleDeleteDialog.name}</span> role? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setRoleDeleteDialog(null)} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Cancel</button>
          <button type="button" onClick={() => deleteRole(roleDeleteDialog)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete role</button>
        </div>
      </Dialog>}

      {userDialog && <Dialog title={userDialog === "create" ? "Add user" : "Manage user"} onClose={() => setUserDialog(null)}>
        <form onSubmit={handleUserSubmit} className="space-y-4">
          {userDialog === "create" ? <>
            <Field label="Full name"><input name="name" required maxLength={255} className={inputClass} /></Field>
            <Field label="Email"><input name="email" type="email" required maxLength={255} className={inputClass} /></Field>
            <Field label="Username"><input name="username" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" className={inputClass} /></Field>
            <Field label="Temporary password"><input name="password" type="password" required minLength={8} maxLength={128} className={inputClass} /></Field>
            <Field label="Role"><select name="roleId" required defaultValue="" className={inputClass}><option value="" disabled>Select a role</option>{assignableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></Field>
          </> : <>
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-body">{userDialog.name} · {userDialog.email}</p>
            <Field label="Role"><select name="roleId" defaultValue={userDialog.roleId} className={inputClass}>{assignableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></Field>
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs leading-5 text-muted">
              Account status, scheduled restrictions, and bans are managed from the user actions menu.
            </p>
          </>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUserDialog(null)} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save user"}</button>
          </div>
        </form>
      </Dialog>}

      {roleDialog && <Dialog title={roleDialog === "create" ? "Add role" : "Edit role"} onClose={() => setRoleDialog(null)}>
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <Field label="Role name"><input name="name" required maxLength={100} readOnly={roleDialog !== "create" && roleDialog.name.toLowerCase() === "superadmin"} defaultValue={roleDialog === "create" ? "" : roleDialog.name} className={`${inputClass} read-only:bg-surface-muted`} /></Field>
          <Field label="Description"><textarea name="description" maxLength={500} rows={3} defaultValue={roleDialog === "create" ? "" : roleDialog.description} className={`${inputClass} h-auto py-2`} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRoleDialog(null)} className="rounded-lg border border-border-control px-4 py-2 text-sm text-body">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save role"}</button>
          </div>
        </form>
      </Dialog>}
    </div>
  );
}
