"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// Safe redirect — only allow relative same-origin paths
function safeRedirect(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//") && !/^\/[a-z]+:/i.test(raw)) {
    return raw;
  }
  return fallback;
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = safeRedirect(searchParams.get("redirect"), "/account");

  // Login form
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot password inline flow
  const [showReset, setShowReset]     = useState(false);
  const [resetEmail, setResetEmail]   = useState("");
  const [resetMsg, setResetMsg]       = useState("");
  const [resetErr, setResetErr]       = useState("");
  const [resetSending, setResetSending] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push(redirectTo);
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code) : "";
      setError(friendlyError(code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetErr("");
    setResetMsg("");
    if (!resetEmail.trim()) { setResetErr("Enter your email address."); return; }
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMsg("Reset link sent! Check your inbox.");
    } catch {
      setResetErr("Couldn't send reset email. Check the address and try again.");
    } finally {
      setResetSending(false);
    }
  }

  const inp =
    "w-full rounded-lg border border-gray-light px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <main className="flex-1 bg-ivory flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink">Welcome Back</h1>
          <p className="text-sm text-gray mt-2">Log in to your NK Fashion Store account</p>
        </div>

        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" className={inp} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" className={inp} />
          </div>

          {error && <p className="text-xs text-rose text-center">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-4">
          <button
            onClick={() => { setShowReset((v) => !v); setResetMsg(""); setResetErr(""); }}
            className="text-xs text-gray hover:text-rose transition-colors"
          >
            Forgot password?
          </button>

          {showReset && (
            <form onSubmit={handleReset} noValidate className="mt-3 flex flex-col gap-2">
              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Your email address" className={inp} />
              {resetErr && <p className="text-xs text-rose">{resetErr}</p>}
              {resetMsg && <p className="text-xs text-green-600">{resetMsg}</p>}
              <button type="submit" disabled={resetSending}
                className="text-sm bg-gray-light text-ink px-4 py-2 rounded-full hover:bg-rose-light transition-colors disabled:opacity-60">
                {resetSending ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/account/signup${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-rose hover:text-ink transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
