import { Building2, KeyRound, LogIn, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { loginAccount, registerAccount } from "../api/client";
import type { AuthResponse } from "../types";

type AuthMode = "login" | "register";

type AuthProps = {
  onAuthenticate: (response: AuthResponse) => void;
};

export function Auth({ onAuthenticate }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("Acme Underwriting");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitLabel = mode === "login" ? "Sign In" : "Create Account";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response =
        mode === "login"
          ? await loginAccount({ email, password })
          : await registerAccount({ name, workspace, email, password });
      onAuthenticate(response);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">
            <ShieldCheck size={24} />
          </span>
          <span>
            <strong>FinCred AI</strong>
            <small>Loan risk workspace</small>
          </span>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => switchMode("login")}>
            <LogIn size={17} />
            <span>Sign In</span>
          </button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => switchMode("register")}>
            <UserPlus size={17} />
            <span>Register</span>
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label className="auth-field">
                <span>Name</span>
                <span>
                  <User size={18} />
                  <input
                    autoComplete="name"
                    minLength={2}
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </span>
              </label>
              <label className="auth-field">
                <span>Workspace</span>
                <span>
                  <Building2 size={18} />
                  <input
                    autoComplete="organization"
                    minLength={2}
                    required
                    value={workspace}
                    onChange={(event) => setWorkspace(event.target.value)}
                  />
                </span>
              </label>
            </>
          )}

          <label className="auth-field">
            <span>Email</span>
            <span>
              <Mail size={18} />
              <input
                autoComplete="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <span>
              <KeyRound size={18} />
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{loading ? "Please wait..." : submitLabel}</span>
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
