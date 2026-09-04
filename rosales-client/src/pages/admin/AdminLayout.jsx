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
  <div className="page-shell grid gap-8 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-12">
    <aside className="panel h-fit overflow-x-auto p-3 lg:sticky lg:top-24">
      <p className="px-3 pb-3 pt-1 text-xs font-black uppercase tracking-[0.18em] text-blue-950">Administration</p>
      <nav className="flex gap-2 lg:flex-col" aria-label="Admin navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          className={({ isActive }) =>
            [
              "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition",
              isActive ? "bg-blue-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-blue-950",
            ].join(" ")
          }
        >
          {link.label}
        </NavLink>
      ))}
      </nav>
    </aside>
    <div className="min-w-0">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
