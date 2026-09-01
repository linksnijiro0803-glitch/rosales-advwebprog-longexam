import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import { getArticleBySlug } from "../services/articleService";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setArticle(await getArticleBySlug(slug));
      } catch (apiError) {
        setError(apiError.message || "Unable to load article.");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && <h1 className="text-3xl font-bold text-zinc-900">Loading article...</h1>}
        {error && <><h1 className="text-3xl font-bold text-zinc-900">Article not found</h1><p className="mt-3 text-sm text-zinc-600">{error}</p></>}
        {article && (
          <div className="max-w-3xl">
            <Button to="/articles">Back to Articles</Button>
            <h1 className="mt-5 text-3xl font-bold text-zinc-900">{article.title}</h1>
            <p className="mt-5 whitespace-pre-wrap text-base leading-7 text-zinc-700">{article.paragraph}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ArticlePage;
