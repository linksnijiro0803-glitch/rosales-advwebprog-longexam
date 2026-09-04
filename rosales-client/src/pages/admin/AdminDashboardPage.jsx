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
      <p className="eyebrow">Overview</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Admin Dashboard</h1>
      <p className="mt-3 text-slate-600">A live overview of marketplace records.</p>
      {loading && <div className="state-panel mt-6" role="status">Loading dashboard…</div>}
      {error && <p className="alert-error mt-6" role="alert">{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(counts).map(([label, value]) => (
          <div key={label} className="panel border-l-4 border-l-amber-400 p-5">
            <p className="text-3xl font-black text-blue-950">{value}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
