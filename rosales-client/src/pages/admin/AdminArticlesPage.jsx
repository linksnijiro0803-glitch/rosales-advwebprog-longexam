import AdminResourcePage from "./AdminResourcePage";
import * as articleService from "../../services/articleService";

const fields = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "preview", label: "Preview", type: "textarea" },
  { name: "paragraph", label: "Paragraph", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }, { value: "disabled", label: "Disabled" }], defaultValue: "published" },
  { name: "isActive", label: "Active", type: "boolean", defaultValue: true, optional: true },
];

const AdminArticlesPage = () => (
  <AdminResourcePage
    title="Articles"
    fields={fields}
    service={{ list: () => articleService.getArticles(), create: articleService.createArticle, update: articleService.updateArticle, delete: articleService.deleteArticle }}
    getItems={(response) => response?.articles || []}
    renderItem={(article) => (
      <>
        <p className="font-semibold text-zinc-900">{article.title}</p>
        <p>{article.slug}</p>
        <p>{article.status}</p>
      </>
    )}
  />
);

export default AdminArticlesPage;
