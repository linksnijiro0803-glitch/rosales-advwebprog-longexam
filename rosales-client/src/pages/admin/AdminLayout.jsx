import { NavLink, Outlet } from "react-router-dom";

const links = [
  { label: "Dashboard", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Products", to: "/admin/products" },
  { label: "Categories", to: "/admin/categories" },
  { label: "Suppliers", to: "/admin/suppliers" },
  { label: "Articles", to: "/admin/articles" },
];

const AdminLayout = () => (
  <div className="grid gap-6 border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[14rem_1fr] lg:px-8">
    <aside className="space-y-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          className={({ isActive }) =>
            [
              "block rounded-full border-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isActive ? "border-zinc-900 bg-zinc-900 text-zinc-50" : "border-zinc-300 text-zinc-600",
            ].join(" ")
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
    <div>
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
