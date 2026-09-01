import AdminResourcePage from "./AdminResourcePage";
import * as categoryService from "../../services/categoryService";

const fields = [
  { name: "categoryName", label: "Category Name" },
  { name: "description", label: "Description", type: "textarea", optional: true },
  { name: "isActive", label: "Active", type: "boolean", defaultValue: true, optional: true },
];

const AdminCategoriesPage = () => (
  <AdminResourcePage
    title="Categories"
    fields={fields}
    service={{ list: () => categoryService.getCategories(), create: categoryService.createCategory, update: categoryService.updateCategory, delete: categoryService.deleteCategory }}
    getItems={(response) => response?.data || []}
    renderItem={(category) => (
      <>
        <p className="font-semibold text-zinc-900">{category.categoryName}</p>
        <p>{category.description || "No description"}</p>
        <p>{category.isActive ? "Active" : "Inactive"}</p>
      </>
    )}
  />
);

export default AdminCategoriesPage;
