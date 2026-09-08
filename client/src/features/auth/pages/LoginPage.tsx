import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { LoginCredentials } from "../auth.types";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!form.identifier.trim()) {
      return "Enter your email or username";
    }

    if (form.password.length < 1) {
      return "Password is required";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);

      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(form);

      const redirect = searchParams.get("redirect");
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";

      navigate(safeRedirect, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="inline-block">
          <img
            src="/cowrite_wordmark.png"
            alt="Cowrite Wordmark"
            className="h-8 sm:h-12 max-w-none mb-2"
            draggable={false}
          />
        </Link>

        <h1 className="font-bold text-2xl mb-6">Welcome back</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Email or Username</label>

            <Input
              type="text"
              placeholder="ashish@cowrite.com or ashish"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              onClear={() => setForm({ ...form, identifier: "" })}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Password</label>

            <PasswordInput
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <Button className="btn-primary mt-2" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {error && <ErrorMessage message={error} />}

        <p className="mt-4 text-sm font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold underline decoration-2">
            Register.
          </Link>
        </p>
      </div>
    </div>
  );
}
