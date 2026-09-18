"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, ShieldCheck, HandMetal, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg("");

    try {
      if (isLogin) {
        setStatusMsg("Authenticating credentials...");
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        // UPDATE: Login route now points to the live Render backend
        const response = await axios.post("https://synsign.onrender.com/api/v1/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        
        localStorage.setItem("synsign_token", response.data.access_token);
        setStatusMsg("Welcome back! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 800);

      } else {
        setStatusMsg("Creating your profile...");
        // UPDATE: Signup route now points to the live Render backend
        await axios.post("https://synsign.onrender.com/api/v1/auth/signup", {
          username: username,
          email: email,
          password: password,
          full_name: fullName,
        });
        
        setStatusMsg("Account created! Switching to login...");
        setTimeout(() => {
          setIsLogin(true);
          setIsLoading(false);
          setStatusMsg("");
          setFullName("");
          setUsername("");
          setEmail("");
          setPassword("");
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setStatusMsg(err.response?.data?.detail || "Something went wrong. Please check your details.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between px-8 lg:px-24 py-10 relative overflow-hidden bg-[#0c1612] text-slate-100">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3 font-bold text-2xl">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 transition-transform hover:scale-105">
            <HandMetal size={24} />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SynSign
          </span>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-16 my-auto max-w-7xl mx-auto w-full py-12 z-10">
        
        {/* Left Headline */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6 w-fit shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="animate-spin" /> AI-Powered ISL Translation Suite
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.1] mb-6 text-white">
            {isLogin ? (
              <>
                Bridging worlds <br />
                through the art of <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  sign language.
                </span>
              </>
            ) : (
              <>
                Start your journey <br />
                through the art of <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  sign language.
                </span>
              </>
            )}
          </h1>
          
          <p className="text-lg lg:text-xl leading-relaxed max-w-xl font-medium text-slate-300">
            {isLogin 
              ? "SynSign connects communication between everyone using intelligent AI, live 3D avatars, and the profound beauty of Indian Sign Language."
              : "Create your account to unlock real-time sign language translation and interactive communication tools built for inclusivity."}
          </p>
        </div>

        {/* Right Card Form */}
        <div className="w-full lg:w-[440px] rounded-[2.5rem] p-8 lg:p-10 shadow-xl border relative transition-all duration-300 bg-[#12221b]/90 border-emerald-900/40 text-white shadow-emerald-950/40">
          
          {/* Switcher Tabs */}
          <div className="flex p-1.5 rounded-2xl mb-6 shadow-inner bg-[#0a120e]">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setStatusMsg(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                isLogin ? "bg-[#1b4332] text-white shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setStatusMsg(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                !isLogin ? "bg-[#1b4332] text-white shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold mb-1">
              {isLogin ? "Welcome back!" : "Create Account"}
            </h2>
            <p className="text-xs font-medium text-slate-400">
              {isLogin ? "Sign in to continue to SynSign" : "Join SynSign and make communication inclusive"}
            </p>
          </div>

          {statusMsg && (
            <div className="mb-4 text-center text-xs font-semibold p-3 rounded-xl border animate-pulse bg-emerald-950/60 text-emerald-300 border-emerald-800">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="off"
                    className="w-full pl-10 pr-3 py-3 text-sm font-semibold border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]/40 transition-all bg-[#0d1813] border-emerald-950 text-white placeholder-slate-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="off"
                  className="w-full pl-10 pr-3 py-3 text-sm font-semibold border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]/40 transition-all bg-[#0d1813] border-emerald-950 text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-3 py-3 text-sm font-semibold border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]/40 transition-all bg-[#0d1813] border-emerald-950 text-white placeholder-slate-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 text-sm font-semibold border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]/40 transition-all bg-[#0d1813] border-emerald-950 text-white placeholder-slate-500"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#122d21] hover:to-[#1b4332] text-white text-sm font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Enter Platform →" : "Create Account →"}
            </button>
          </form>

          {/* Bottom toggle prompt */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => setIsLogin(false)} className="font-bold text-emerald-400 hover:underline cursor-pointer">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setIsLogin(true)} className="font-bold text-emerald-400 hover:underline cursor-pointer">Sign in</button></>
            )}
          </div>

        </div>

      </div>

      {/* Footer Privacy Note */}
      <footer className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 pb-2 z-10">
        <ShieldCheck size={14} className="text-emerald-400" />
        <span>Your data is safe with us. We respect your privacy.</span>
      </footer>

    </main>
  );
}