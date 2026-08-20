"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Sign-up failed. Please try again.";
  }
}

export default function SignUpPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = safeRedirect(searchParams.get("redirect"), "/account");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Name is required."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Create lightweight customer profile — wrapped separately so a Firestore
      // write failure doesn't block the user from completing sign-up.
      try {
        await setDoc(doc(db, "customers", cred.user.uid), {
          name:      name.trim(),
          email:     email.trim(),
          createdAt: Date.now(),
        });
      } catch (profileErr) {
        console.warn("Failed to create customer profile (non-critical):", profileErr);
      }

      router.push(redirectTo);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(friendlyError(code));
    } finally {
      setSubmitting(false);
    }
  }

  const inp =
    "w-full rounded-lg border border-gray-light px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <main className="flex-1 bg-ivory flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink">Create Account</h1>
          <p className="text-sm text-gray mt-2">Join NK Fashion Store</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Full Name
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nimal Karunaratne" autoComplete="name" className={inp} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" className={inp} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters" autoComplete="new-password" className={inp} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Confirm Password
            </label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" autoComplete="new-password" className={inp} />
          </div>

          {error && <p className="text-xs text-rose text-center">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray mt-6">
          Already have an account?{" "}
          <Link
            href={`/account/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-rose hover:text-ink transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
