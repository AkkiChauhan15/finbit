import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AuthShell from '../components/AuthShell.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { isValidEmail, mapApiErrors } from '../utils/formErrors.js';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.';
    if (!values.password) nextErrors.password = 'Password is required.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await login(values);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      setErrors(mapApiErrors(error));
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      description="Continue building stronger habits and a clearer picture of your wealth."
      footerText="New here?"
      footerLink="/register"
      footerLabel="Create an account"
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-[#a43a3a]"
            role="alert"
          >
            {submitError}
          </div>
        )}
        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={updateValue}
          error={errors.email}
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={updateValue}
          error={errors.password}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
