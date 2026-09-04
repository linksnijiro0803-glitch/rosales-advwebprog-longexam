import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

const inputClasses = 'field';

const actionButtonClassName = 'w-full';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const successMessage = location.state?.message;
  const redirectTo = location.state?.from?.pathname || '/products';

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate(response.user?.role === 'Admin' ? '/products' : redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError.message || 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Sign in to your account</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Access your cart, orders, and account details.
      </p>

      {successMessage && (
          <p className="alert-success mt-5" role="status">
          {successMessage}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signin-email" className="text-sm font-bold text-slate-700">
            Email Address
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="student@email.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="signin-password" className="text-sm font-bold text-slate-700">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 accent-blue-950"
            />
            <span>Keep me signed in on this device</span>
          </label>
        </div>

        {error && (
          <p className="alert-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </Button>

      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/auth/signup" className="font-bold text-blue-950 transition hover:text-blue-700">
          Sign Up
        </Link>
      </div>
    </>
  );
};

export default SignInPage;
