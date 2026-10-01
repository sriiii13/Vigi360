import React, { useState } from "react";
import { useFleet } from "../context/FleetContext";

export const LoginPage = () => {
  const { login } = useFleet();
  const [email, setEmail] = useState("manager@fleet.com");
  const [password, setPassword] = useState("••••••••••••");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div class="min-h-screen w-full bg-surface text-on-surface flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div class="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-surface">
        <div>
          <div class="flex items-center gap-3 mb-12">
            <img
              src="/vigi360_brand_logo.png"
              alt="Vigi360 Logo"
              class="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div class="hidden flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
              <span class="material-symbols-outlined text-primary text-3xl">visibility</span>
              <span>Vigi360</span>
            </div>
          </div>

          <div class="max-w-md mx-auto lg:mx-0">
            <h1 class="text-3xl font-bold text-on-surface tracking-tight mb-2">
              Manager Portal Login
            </h1>
            <p class="text-on-surface-variant text-sm mb-8">
              Access real-time fleet safety telemetry, driver risk scores, and alert feeds.
            </p>

            <form onSubmit={handleSubmit} class="space-y-5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Manager Email Address
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@fleet.com"
                    class="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Password
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    class="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-on-surface-variant">
                  <input type="checkbox" defaultChecked class="rounded text-primary focus:ring-primary" />
                  <span>Remember session</span>
                </label>
                <a href="#" class="text-primary font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                class="w-full bg-primary text-on-primary py-3.5 px-6 rounded-xl font-bold text-sm hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 group mt-6"
              >
                <span>Login to Dashboard</span>
                <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </form>
          </div>
        </div>

        <div class="mt-12 text-xs text-outline text-center lg:text-left">
          © 2026 Vigi360 Fleet Safety Systems Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Hero Graphic (Stitch ZIP 0 Design) */}
      <div class="w-full lg:w-1/2 bg-gradient-to-br from-primary to-primary-container p-8 lg:p-16 flex flex-col justify-between text-on-primary relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-white inline-block mb-6">
            AI Fleet Safety Monitoring
          </span>
          <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-lg mb-4">
            Safer journeys through intelligent driver monitoring.
          </h2>
          <p class="text-white/80 text-sm max-w-md leading-relaxed">
            Real-time drowsiness detection, distraction tracking, and predictive safety analytics for modern fleet management.
          </p>
        </div>

        <div class="relative z-10 grid grid-cols-2 gap-4 mt-8">
          <div class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <span class="material-symbols-outlined text-white text-2xl mb-1">vital_signs</span>
            <div class="text-xl font-bold">99.4%</div>
            <div class="text-xs text-white/70">Fatigue Detection Precision</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <span class="material-symbols-outlined text-white text-2xl mb-1">warning_amber</span>
            <div class="text-xl font-bold">&lt; 1.2s</div>
            <div class="text-xs text-white/70">Critical Alert Latency</div>
          </div>
        </div>
      </div>
    </div>
  );
};
