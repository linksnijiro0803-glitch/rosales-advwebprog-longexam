import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getArticles } from "../../services/articleService";
import { getCategories } from "../../services/categoryService";
import { getProducts } from "../../services/productService";
import { getSuppliers } from "../../services/supplierService";
import { getUsers } from "../../services/userService";

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [users, products, categories, suppliers, articles] = await Promise.all([
          getUsers(token),
          getProducts({ limit: 100 }),
          getCategories(),
          getSuppliers(),
          getArticles(),
        ]);

        setCounts({
          users: users?.users?.length || 0,
          products: products?.count ?? products?.data?.length ?? 0,
          categories: categories?.data?.length || 0,
          suppliers: suppliers?.data?.length || 0,
          articles: articles?.articles?.length || 0,
        });
      } catch (apiError) {
        setError(apiError.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
      {loading && <p className="mt-4 text-sm text-zinc-600">Loading dashboard...</p>}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(counts).map(([label, value]) => (
          <div key={label} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-5">
            <p className="text-3xl font-bold text-zinc-900">{value}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
