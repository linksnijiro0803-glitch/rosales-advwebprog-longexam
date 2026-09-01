export const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export const getId = (value) => value?._id || value?.id || value;

export const getProductName = (product) => product?.productName || "Product";

export const getCategoryName = (category) => {
  if (!category) {
    return "Uncategorized";
  }

  if (typeof category === "string") {
    return category;
  }

  return category.categoryName || "Uncategorized";
};

export const getSupplierName = (supplier) => {
  if (!supplier) {
    return "";
  }

  if (typeof supplier === "string") {
    return supplier;
  }

  return supplier.supplierName || "";
};

export const getUserName = (user) => user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "User";
