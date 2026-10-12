import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { AlertIcon, CheckIcon, SpinnerIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { validateLogin } from "../utils/validation";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: location.state?.email ?? "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const notice = location.state?.notice;
  // Send the user back to the page they originally tried to open
  const redirectTo = location.state?.from?.pathname ?? "/home";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(
        error?.response?.status === 401 ? "Invalid Credentials" : getErrorMessage(error, "Unable to log in.")
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to ShopKart"
      subtitle="Pick up right where you left off."
      footer={
        <>
          New to ShopKart?{" "}
          <Link to="/register" className="font-semibold text-ink underline decoration-marigold decoration-2 underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {notice && !serverError && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-leaf bg-leaf-soft px-3 py-2.5 text-sm font-medium text-leaf">
            <CheckIcon width={16} height={16} /> {notice}
          </div>
        )}
        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border-2 border-chili bg-chili-soft px-3 py-2.5 text-sm font-semibold text-chili" role="alert">
            <AlertIcon className="mt-0.5 shrink-0" width={16} height={16} />
            {serverError}
          </div>
        )}

        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" placeholder="john@gmail.com" />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Your password"
        />

        <button type="submit" className="btn btn-primary w-full py-3 text-base" disabled={submitting}>
          {submitting && <SpinnerIcon width={18} height={18} />}
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
