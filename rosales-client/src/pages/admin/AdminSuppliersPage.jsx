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

const AdminSuppliersPage = () => (
  <AdminResourcePage
    title="Suppliers"
    fields={fields}
    service={{ list: () => supplierService.getSuppliers(), create: supplierService.createSupplier, update: supplierService.updateSupplier, delete: supplierService.deleteSupplier }}
    getItems={(response) => response?.data || []}
    renderItem={(supplier) => (
      <>
        <p className="font-semibold text-zinc-900">{supplier.supplierName}</p>
        <p>{supplier.contactPerson || "No contact person"}</p>
        <p>{supplier.email || "No email"} | {supplier.contactNumber || "No number"}</p>
      </>
    )}
  />
);

export default AdminSuppliersPage;
