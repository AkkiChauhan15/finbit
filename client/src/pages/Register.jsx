import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthShell from '../components/AuthShell.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { isValidEmail, mapApiErrors } from '../utils/formErrors.js';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (values.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    if (!isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.';
    if (values.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = 'Passwords do not match.';

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
      const { confirmPassword: _confirmPassword, ...registrationValues } = values;
      await register({ ...registrationValues, name: registrationValues.name.trim() });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors(mapApiErrors(error));
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Start your journey"
      title="Create your account"
      description="Set up a secure account now; your financial profile can be refined after registration."
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Log in"
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
          id="register-name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={updateValue}
          error={errors.name}
        />
        <FormField
          id="register-email"
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
          id="register-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={updateValue}
          error={errors.password}
        />
        <FormField
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={updateValue}
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
