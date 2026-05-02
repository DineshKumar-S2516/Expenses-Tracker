import { BadgeIndianRupee, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { extractError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await signup(form.name, form.email, form.password);
        toast.success("Account created with starter categories");
      } else {
        await login(form.email, form.password);
        toast.success("Logged in successfully");
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span className="brand-mark">
            <BadgeIndianRupee size={24} />
          </span>
          <div>
            <strong>FinTrack</strong>
            <small>Personal finance workspace</small>
          </div>
        </div>

        <div className="auth-copy">
          <span className="eyebrow">Secure money management</span>
          <h1>{isSignup ? "Create your finance hub" : "Sign in to your dashboard"}</h1>
          <p>Track expenses, budgets, recurring bills, linked payments, and savings goals from one focused workspace.</p>
        </div>

        <form className="form auth-form" onSubmit={submit}>
          {isSignup ? (
            <label className="field">
              <span>Name</span>
              <div className="input-icon">
                <UserRound size={18} />
                <input name="name" required value={form.name} onChange={update} placeholder="Your name" />
              </div>
            </label>
          ) : null}
          <label className="field">
            <span>Email</span>
            <div className="input-icon">
              <Mail size={18} />
              <input name="email" type="email" required value={form.email} onChange={update} placeholder="you@example.com" />
            </div>
          </label>
          <label className="field">
            <span>Password</span>
            <div className="input-icon">
              <LockKeyhole size={18} />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update}
                placeholder="Minimum 6 characters"
              />
            </div>
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to FinTrack?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Login" : "Create account"}</Link>
        </p>
      </section>
    </main>
  );
}
