import { useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { updateUser } from "../services/userService";

const inputClasses = "field";

const AccountPage = () => {
  const { user, token, updateStoredUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await updateUser(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
      }, token);

      updateStoredUser({
        ...user,
        id: updatedUser._id || updatedUser.id || user.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      setSuccess("Profile updated successfully.");
    } catch (apiError) {
      setError(apiError.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell page-section">
      <section>
        <p className="eyebrow">Your profile</p>
        <h1 className="page-title mt-2">Account</h1>
        <p className="mt-3 text-slate-600">Keep your account details up to date.</p>
      </section>

      <section className="panel mt-8 max-w-2xl p-5 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="account-name">Name</label>
            <input id="account-name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="account-email">Email</label>
            <input id="account-email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Role</p>
            <p className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">{user?.role || "Customer"} <span className="ml-2 font-normal text-slate-400">(read only)</span></p>
          </div>
          {error && <p className="alert-error" role="alert">{error}</p>}
          {success && <p className="alert-success" role="status">{success}</p>}
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </form>
      </section>
    </div>
  );
};

export default AccountPage;
