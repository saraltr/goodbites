"use client";

import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // store error messages from login attempt
  const [error, setError] = useState("");
  // loading state while authenticating
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // handle form submission for login
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (!auth) {
        throw new Error("Firebase Auth not initialized. This should run on the client.");
      }

      // log in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // redirect to their own profile page
      router.replace(`/profile/${user.uid}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5"
      >
        <h2 className="text-3xl font-semibold text-center text-green-700">Welcome Back!</h2>

        <label 
          htmlFor="username1"
          className="block text-black text-left font-medium mb-1">
          Email address
        </label>
        <input
          type="email"
          name="username1"
          id="username1"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <div className="mb-4">
          <label 
            htmlFor="password1"
            className="block text-black font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password1"
              id="password1"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>


        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-green-700 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
