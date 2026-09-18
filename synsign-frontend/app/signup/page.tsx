"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, ShieldCheck, HandMetal } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("Creating your account...");

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/auth/signup", {
        username: username,
        email: email,
        password: password,
        full_name: fullName,
      });
      
      console.log("Signup successful!");
      setStatusMsg("Account created! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      
    } catch (err: any) {
      console.error("Signup failed:", err);
      setStatusMsg(err.response?.data?.detail || "Signup failed. Try a different username/email.");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between bg-[#f5f4f0] text-slate-900 px-8 lg:px-24 py-10 relative overflow-hidden">
      
      {/* Top Branding Header */}
      <div className="flex items-center gap-2.5 font-bold text-2xl text-slate-900">
        <div className="w-10 h-10 rounded-xl bg-[#1b4332] text-white flex items-center justify-center shadow-md">
          <HandMetal size={22} />
        </div>
        <span>SynSign</span>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-16 my-auto max-w-7xl mx-auto w-full py-12">
        
        {/* Left Side: Headline */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.1] mb-8 text-slate-900">
            Start your journey <br />
            through the art of <br />
            <span className="text-[#1b4332]">sign language.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
            Create an account to access real-time sign language translation and interactive communication tools with SynSign.
          </p>
        </div>

        {/* Right Side: Floating Card Form */}
        <div className="w-full lg:w-[440px] bg-white rounded-3xl p-8 lg:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.05)] border border-slate-200/80 relative">
          
          {/* Top Icon Badge */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#1b4332] font-bold text-lg shadow-sm">
              ✨
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">Create Account</h2>
            <p className="text-xs text-slate-500">Join SynSign and make communication inclusive</p>
          </div>

          {statusMsg && (
            <div className="mb-4 text-center text-xs font-medium p-2 rounded bg-slate-100 text-slate-700">
              {statusMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Riya Sangle"
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b4332]" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="riya_123"
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b4332]" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="riya@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b4332]" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b4332]" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1b4332] hover:bg-[#122d21] text-white text-sm font-medium py-3 rounded-xl transition-colors shadow-md mt-2">
              Sign Up →
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-xs text-slate-400 bg-white">or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Google Button */}
          <button type="button" className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Login Link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account? <a href="/login" className="font-medium text-[#1b4332] hover:underline">Sign in</a>
          </div>

        </div>

      </div>

      {/* Footer Privacy Note */}
      <footer className="flex items-center justify-center gap-2 text-xs text-slate-500 pb-2">
        <ShieldCheck size={14} className="text-slate-400" />
        <span>Your data is safe with us. We respect your privacy.</span>
      </footer>

    </main>
  );
}