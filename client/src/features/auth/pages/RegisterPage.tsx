import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterCredentials } from "../auth.types";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterCredentials>({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (form.name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }

    if (!/^[a-z0-9_]+$/.test(form.username)) {
      return "Username can only contain lowercase letters, numbers, and underscores";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Enter a valid email address";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (form.password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to register. Please try again."));
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

        <h1 className="font-bold text-2xl mb-6">
          Create an account & start collaborating today
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Name</label>

            <Input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onClear={() => setForm({ ...form, name: "" })}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Username</label>

            <Input
              type="text"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onClear={() => setForm({ ...form, username: "" })}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Email</label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onClear={() => setForm({ ...form, email: "" })}
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

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Confirm Password</label>

            <PasswordInput
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button className="btn-primary mt-2" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {error && <ErrorMessage message={error} />}

        <p className="mt-4 text-sm font-medium">
          Already have an account?{" "}
          <Link to="/login" className="font-bold underline decoration-2">
            Sign in.
          </Link>
        </p>
      </div>
    </div>
  );
}
