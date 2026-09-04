import AdminResourcePage from "./AdminResourcePage";
import { getCategories } from "../../services/categoryService";
import * as productService from "../../services/productService";
import { getSuppliers } from "../../services/supplierService";
import { formatCurrency, getCategoryName, getSupplierName } from "../../utils/formatters";

const fields = [
  { name: "productName", label: "Product Name" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price", label: "Price", type: "number" },
  { name: "stock", label: "Stock", type: "number" },
  { name: "images", label: "Image URLs", type: "images", optional: true },
  { name: "category", label: "Category", type: "select", optionsKey: "categories" },
  { name: "supplier", label: "Supplier", type: "select", optionsKey: "suppliers", optional: true },
  { name: "condition", label: "Condition", type: "select", options: ["new", "like-new", "good", "fair", "poor"].map((value) => ({ value, label: value })), defaultValue: "good" },
  { name: "status", label: "Status", type: "select", options: ["available", "reserved", "sold", "inactive"].map((value) => ({ value, label: value })), defaultValue: "available" },
];

const optionLoaders = {
  categories: async () => {
    const response = await getCategories();
    return (response?.data || []).map((category) => ({ value: category._id, label: category.categoryName }));
  },
  suppliers: async () => {
    const response = await getSuppliers();
    return (response?.data || []).map((supplier) => ({ value: supplier._id, label: supplier.supplierName }));
  },
};

const getProducts = (response) => response?.data || [];

const adminProductService = {
  list: () => productService.getProducts({ limit: 100 }),
  create: productService.createProduct,
  update: productService.updateProduct,
  delete: productService.deleteProduct,
};

const renderProduct = (product) => (
  <>
    <p className="font-bold text-slate-950">{product.productName}</p>
    <p>{formatCurrency(product.price)} | Stock: {product.stock}</p>
    <p>{getCategoryName(product.category)} {getSupplierName(product.supplier) ? `| ${getSupplierName(product.supplier)}` : ""}</p>
    <p>{product.condition} | {product.status}</p>
  </>
);

const AdminProductsPage = () => (
  <AdminResourcePage
    title="Products"
    fields={fields}
    service={adminProductService}
    getItems={getProducts}
    renderItem={renderProduct}
    optionLoaders={optionLoaders}
  />
);

export default AdminProductsPage;
