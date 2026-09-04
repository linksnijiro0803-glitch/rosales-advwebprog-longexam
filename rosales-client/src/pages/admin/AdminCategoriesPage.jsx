import AdminResourcePage from "./AdminResourcePage";
import * as categoryService from "../../services/categoryService";

const fields = [
  { name: "categoryName", label: "Category Name" },
  { name: "description", label: "Description", type: "textarea", optional: true },
  { name: "isActive", label: "Active", type: "boolean", defaultValue: true, optional: true },
];

const adminCategoryService = {
  list: categoryService.getCategories,
  create: categoryService.createCategory,
  update: categoryService.updateCategory,
  delete: categoryService.deleteCategory,
};

const getCategories = (response) => response?.data || [];

const AdminCategoriesPage = () => (
  <AdminResourcePage
    title="Categories"
    fields={fields}
    service={adminCategoryService}
    getItems={getCategories}
    renderItem={(category) => (
      <>
        <p className="font-bold text-slate-950">{category.categoryName}</p>
        <p>{category.description || "No description"}</p>
        <p>{category.isActive ? "Active" : "Inactive"}</p>
      </>
    )}
  />
);

export default AdminCategoriesPage;
