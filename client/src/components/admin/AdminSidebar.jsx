import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/books", label: "Books" },
  { to: "/admin/categories", label: "Categories" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-text/10 bg-background px-4 py-8">
      <p className="mb-6 px-2 text-[11px] uppercase tracking-[0.15em] text-text/50">
        Admin
      </p>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text/70 hover:bg-text/5 hover:text-text"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}