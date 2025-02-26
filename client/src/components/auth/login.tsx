"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../lib/store/store";
import { loginUser } from "../../lib/store/features/auth-slice";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };
  useEffect(()=>{
    if (user) {
      router.push("/home");
    }
  },[user])

  return (  
    <div className="flex justify-center items-center bg-black text-white">
      <div className="p-6 bg-gray-900 rounded-xl shadow-lg w-96">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/twitter-logo.png"
            width={50}
            height={50}
            alt="X Logo"
          />
        </div>

        <h1 className="text-2xl font-bold text-center">Sign in to X</h1>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 mt-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mt-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 outline-none"
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-full mt-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
