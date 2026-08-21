"use client";

// Admin Setup Requirements:
// 1. Create admin user in Firebase Console → Authentication → Add user
// 2. In Firestore → admins/{uid} doc: { name, email, roleId }
// 3. In Firestore → roles/{roleId} doc: { name: "Super Admin", permissions: [...] }
// Seed roles via /admin/users page → "Seed Default Roles" button

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Map Firebase Auth error codes to friendly messages
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(friendlyError(code));
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border border-gray-light px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-ivory rounded-2xl p-8 w-full max-w-md shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Image
            src="/Logo.png"
            alt="NK Fashion Store"
            width={80}
            height={80}
            className="rounded-full object-cover"
            priority
          />
          <div>
            <p className="font-serif text-2xl font-bold text-ink tracking-wide">
              NK Fashion Store
            </p>
            <p className="text-xs text-gray mt-1 uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nkfashion.lk"
              autoComplete="email"
              className={inputBase}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputBase}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose text-center -mt-1">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
