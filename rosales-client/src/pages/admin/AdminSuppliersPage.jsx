import AdminResourcePage from "./AdminResourcePage";
import * as supplierService from "../../services/supplierService";

const fields = [
  { name: "supplierName", label: "Supplier Name" },
  { name: "contactPerson", label: "Contact Person", optional: true },
  { name: "email", label: "Email", type: "email", optional: true },
  { name: "contactNumber", label: "Contact Number", optional: true },
  { name: "address", label: "Address", type: "textarea", optional: true },
  { name: "isActive", label: "Active", type: "boolean", defaultValue: true, optional: true },
];

const adminSupplierService = {
  list: supplierService.getSuppliers,
  create: supplierService.createSupplier,
  update: supplierService.updateSupplier,
  delete: supplierService.deleteSupplier,
};

const getSuppliers = (response) => response?.data || [];

const AdminSuppliersPage = () => (
  <AdminResourcePage
    title="Suppliers"
    fields={fields}
    service={adminSupplierService}
    getItems={getSuppliers}
    renderItem={(supplier) => (
      <>
        <p className="font-bold text-slate-950">{supplier.supplierName}</p>
        <p>{supplier.contactPerson || "No contact person"}</p>
        <p>{supplier.email || "No email"} | {supplier.contactNumber || "No number"}</p>
      </>
    )}
  />
);

export default AdminSuppliersPage;
