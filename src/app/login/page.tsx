"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "Invalid credentials");
        }
      } else {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const phone = formData.get("phone") as string;

        const registerData: any = {
          email,
          password,
          firstName,
          lastName,
        };
        
        // Only include phone if it has a value
        if (phone && phone.trim()) {
          registerData.phone = phone.trim();
        }

        const result = await register(registerData);

        if (!result.success) {
          setError(result.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-32 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-white font-display text-2xl font-bold">L</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-charcoal mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-charcoal-lighter text-sm">
            {isLogin ? "Sign in to manage your appointments." : "Join Luxe for a premium experience."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-soft">
          <div className="flex gap-2 mb-6 p-1 bg-cream rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
                isLogin ? "bg-white text-charcoal shadow-soft" : "text-charcoal-lighter"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
                !isLogin ? "bg-white text-charcoal shadow-soft" : "text-charcoal-lighter"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full px-4 py-3 bg-cream border border-transparent rounded-xl text-sm focus:border-gold focus:bg-white transition"
                    placeholder="Jane"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full px-4 py-3 bg-cream border border-transparent rounded-xl text-sm focus:border-gold focus:bg-white transition"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-cream border border-transparent rounded-xl text-sm focus:border-gold focus:bg-white transition"
                placeholder="you@email.com"
                required
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 bg-cream border border-transparent rounded-xl text-sm focus:border-gold focus:bg-white transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 bg-cream border border-transparent rounded-xl text-sm focus:border-gold focus:bg-white transition"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 gold-gradient text-charcoal font-semibold rounded-xl hover:shadow-gold transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
