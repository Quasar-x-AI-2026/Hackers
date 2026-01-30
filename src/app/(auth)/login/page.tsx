"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      // ✅ Re-fetch the session from the server after login
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (session?.user?.role === "employee") {
        router.push("/dashboard/employee");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 transition-colors duration-300 p-6">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 transition-all duration-300">

        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800 dark:text-white tracking-tight">
          Welcome
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to continue to your dashboard
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-2 text-sm rounded-md text-center">
              {error}
            </p>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-400 hover:from-blue-700  text-white py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-400 dark:text-blue-400 hover:underline font-medium"
          >
            Register
          </a>
        </p>
      </div>
    </div>

  );
}
