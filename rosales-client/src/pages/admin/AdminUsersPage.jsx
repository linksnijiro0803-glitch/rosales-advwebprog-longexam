import AdminResourcePage from "./AdminResourcePage";
import * as userService from "../../services/userService";

const fields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password", omitWhenEmpty: true },
  { name: "role", label: "Role", type: "select", options: [{ value: "Customer", label: "Customer" }, { value: "Admin", label: "Admin" }], defaultValue: "Customer" },
  { name: "isActive", label: "Active", type: "boolean", defaultValue: true, optional: true },
];

const adminUserService = {
  list: userService.getUsers,
  create: userService.createUser,
  update: userService.updateUser,
  delete: userService.deleteUser,
};

const getUsers = (response) => response?.users || [];

const AdminUsersPage = () => (
  <AdminResourcePage
    title="Users"
    fields={fields}
    service={adminUserService}
    getItems={getUsers}
    renderItem={(user) => (
      <>
        <p className="font-bold text-slate-950">{user.name}</p>
        <p>{user.email}</p>
        <p>{user.role} | {user.isActive ? "Active" : "Inactive"}</p>
      </>
    )}
  />
);

export default AdminUsersPage;
