"use client";

import AdminTablePage, { type AdminSection } from "./AdminTablePage";

export default function AdminSectionWithPagination({ section }: { section: AdminSection }) {
  return (
    <div className="admin-section-page min-w-0">
      <AdminTablePage section={section} />
    </div>
  );
}
