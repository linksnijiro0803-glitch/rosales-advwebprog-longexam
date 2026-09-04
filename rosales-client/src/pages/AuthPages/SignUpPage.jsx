import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

const inputClasses = 'field';

const actionButtonClassName = 'w-full';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const name = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !formData.email.trim() || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register({
        name,
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate('/auth/signin', {
        replace: true,
        state: { message: 'Account created successfully. Please log in.' },
      });
    } catch (apiError) {
      setError(apiError.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Join the community</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Create your account</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Start browsing, ordering, and reviewing campus listings.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="text-sm font-bold text-slate-700">
              First Name
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-bold text-slate-700">
              Last Name
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-bold text-slate-700">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-bold text-slate-700">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className={inputClasses}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use at least 8 characters.
          </p>
        </div>

        {error && (
          <p className="alert-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Account'}
        </Button>

      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-bold text-blue-950 transition hover:text-blue-700">
          Log In
        </Link>
      </div>
    </>
  );
};

export default SignUpPage;
