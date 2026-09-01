import { useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { updateUser } from "../services/userService";

const inputClasses =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50";

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
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Account</h1>
        <p className="mt-3 text-sm text-zinc-600">Signed in as {user?.role || "Customer"}.</p>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-zinc-700" htmlFor="account-name">Name</label>
            <input id="account-name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700" htmlFor="account-email">Email</label>
            <input id="account-email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700">Role</p>
            <p className="mt-2 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-600">{user?.role}</p>
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </form>
      </section>
    </div>
  );
};

export default AccountPage;
