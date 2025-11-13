"use client";

import { useState, FormEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/utils/FirebaseConfig";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // toggle confirm password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // loading state during account creation
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // validate username is not empty
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    try {
      setLoading(true);

      // create user with firebase auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // update display name in firebase auth
      await updateProfile(user, { displayName: username });

      // create user document in firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      setSuccess("Account created successfully!");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsername("");

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 my-6 rounded-2xl shadow-xl w-full max-w-md space-y-5"
      >
        <h2 className="text-3xl font-semibold text-center text-green-700">
          Create Your Account
        </h2>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-black font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-black font-medium mb-1">
            Email address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-black font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
              title="Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
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

          {/* password rules */}
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li className={password.length >= 8 ? "text-green-600" : ""}>
              Minimum 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
              At least 1 uppercase letter
            </li>
            <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
              At least 1 lowercase letter
            </li>
            <li className={/\d/.test(password) ? "text-green-600" : ""}>
              At least 1 number
            </li>
            <li className={/[@$!%*?&]/.test(password) ? "text-green-600" : ""}>
              At least 1 special character (@$!%*?&)
            </li>
          </ul>
        </div>

        {/* confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-black font-medium mb-1"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* error / success messages */}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        {/* submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* login link */}
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-700 hover:underline font-medium"
          >
            Log in
          </a>
        </p>
      </form>
    </div>

  );
}
