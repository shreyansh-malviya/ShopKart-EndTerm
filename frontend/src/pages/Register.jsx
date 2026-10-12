import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { AlertIcon, SpinnerIcon } from "../components/Icons";
import { authApi, getErrorMessage } from "../services/api";
import { validateRegister } from "../utils/validation";

const EMPTY = { fullName: "", email: "", password: "", phone: "" };

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear a field's error as soon as the user edits it
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      // Success -> go to Login with the email pre-filled
      navigate("/login", {
        replace: true,
        state: { email: form.email.trim(), notice: "Account created! Please log in." },
      });
    } catch (error) {
      if (error?.response?.status === 409) {
        setErrors((errs) => ({ ...errs, email: "This email is already registered." }));
      } else {
        setServerError(getErrorMessage(error, "Unable to create your account."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New here?"
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink underline decoration-marigold decoration-2 underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border-2 border-chili bg-chili-soft px-3 py-2.5 text-sm text-chili" role="alert">
            <AlertIcon className="mt-0.5 shrink-0" width={16} height={16} />
            {serverError}
          </div>
        )}

        <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} autoComplete="name" placeholder="John Doe" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" placeholder="john@gmail.com" />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
        <FormField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} autoComplete="tel" placeholder="9876543210" />

        <button type="submit" className="btn btn-primary w-full py-3 text-base" disabled={submitting}>
          {submitting && <SpinnerIcon width={18} height={18} />}
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
