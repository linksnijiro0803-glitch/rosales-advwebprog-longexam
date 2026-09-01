import { useEffect, useState } from "react";
import Button from "../components/Button";
import { getArticles } from "../services/articleService";

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getArticles();
        setArticles(Array.isArray(response?.articles) ? response.articles : []);
      } catch (apiError) {
        setError(apiError.message || "Unable to load articles.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Articles</h1>
      </section>
      <section className="grid gap-4 border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 lg:px-8">
        {loading && <p className="text-sm text-zinc-600">Loading articles...</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!loading && !error && articles.length === 0 && <p className="text-sm text-zinc-600">No articles available.</p>}
        {articles.map((article) => (
          <article key={article._id} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{article.status}</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{article.preview}</p>
            <Button to={`/articles/${article.slug}`} className="mt-4">Read</Button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ArticlesPage;
