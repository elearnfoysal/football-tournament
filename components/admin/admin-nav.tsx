import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/modules";

export function AdminNav() {
  return (
    <nav aria-label="Admin modules" className="mb-8 overflow-x-auto border-b pb-3">
      <ul className="flex min-w-max flex-wrap gap-2">
        {ADMIN_NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
