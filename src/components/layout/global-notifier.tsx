"use client";

import React, { useEffect } from "react";
import { useUIStore, GlobalAlert } from "@/stores/ui-store";
import { 
  WifiOff, 
  Clock, 
  Lock, 
  Server, 
  GlobeOff, 
  X, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

// Sub-component to manage individual toast auto-dismiss timers
function ToastItem({ alert, onClose }: { alert: GlobalAlert; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [alert.id, onClose]);

  // Determine icon and color schemes based on code type
  let Icon = AlertCircle;
  let themeColor = "emerald";
  let title = "Notification";
  let animateClass = "";

  switch (alert.code) {
    case "500":
      Icon = Server;
      themeColor = "red";
      title = "Server Error (500)";
      animateClass = "animate-pulse-light";
      break;
    case "401":
      Icon = Lock;
      themeColor = "rose";
      title = "Auth Session Expired";
      animateClass = "animate-shake";
      break;
    case "403":
      Icon = Lock;
      themeColor = "amber";
      title = "Access Forbidden (403)";
      animateClass = "animate-shake";
      break;
    case "404":
      Icon = HelpCircle;
      themeColor = "sky";
      title = "Resource Not Found (404)";
      animateClass = "animate-bounce-slow";
      break;
    case "timeout":
      Icon = Clock;
      themeColor = "yellow";
      title = "Request Timeout";
      animateClass = "animate-spin-slow";
      break;
    case "network-failed":
      Icon = GlobeOff;
      themeColor = "red";
      title = "Connection Failed";
      animateClass = "animate-pulse-heavy";
      break;
    case "success":
      Icon = CheckCircle2;
      themeColor = "emerald";
      title = "Success";
      animateClass = "animate-bounce-slow";
      break;
    case "info":
      Icon = Info;
      themeColor = "sky";
      title = "Information";
      animateClass = "animate-pulse-light";
      break;
    case "generic":
      Icon = AlertCircle;
      themeColor = "emerald";
      title = "Notification";
      animateClass = "animate-bounce-slow";
      break;
  }

  // Color tokens mapping
  const borderColors: Record<string, string> = {
    red: "border-red-500/20 shadow-red-500/10",
    rose: "border-rose-500/20 shadow-rose-500/10",
    amber: "border-amber-500/20 shadow-amber-500/10",
    sky: "border-sky-500/20 shadow-sky-500/10",
    yellow: "border-yellow-500/20 shadow-yellow-500/10",
    emerald: "border-emerald-500/20 shadow-emerald-500/10",
  };

  const iconColors: Record<string, string> = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div 
      className={cn(
        "w-80 border bg-[#090d16]/90 backdrop-blur-xl rounded-2xl p-4 flex gap-3 shadow-2xl relative transition-all duration-300 animate-slide-in select-none",
        borderColors[themeColor] || "border-white/10 shadow-black/40"
      )}
    >
      {/* Visual icon container with pulsing ambient halo */}
      <div className="relative shrink-0 select-none">
        <div className="absolute inset-0 rounded-xl bg-current opacity-5 blur-sm scale-110" />
        <div 
          className={cn(
            "h-10 w-10 rounded-xl border flex items-center justify-center relative z-10", 
            iconColors[themeColor] || "text-zinc-400 bg-white/5 border-white/10"
          )}
        >
          <Icon className={cn("h-5 w-5", animateClass)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block leading-none mb-1">
          {title}
        </span>
        <p className="text-xs font-semibold text-zinc-200 leading-normal">
          {alert.message}
        </p>
      </div>

      {/* Close button */}
      <Tooltip content="Dismiss" position="left">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

export function GlobalNotifier() {
  const isOffline = useUIStore((state) => state.isOffline);
  const setIsOffline = useUIStore((state) => state.setIsOffline);
  const globalAlerts = useUIStore((state) => state.globalAlerts);
  const removeGlobalAlert = useUIStore((state) => state.removeGlobalAlert);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial state check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOffline]);

  return (
    <>
      {/* ── STYLESHEET FOR SPECIAL LOTTIE-LIKE CSS MICRO-ANIMATIONS ── */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes pulseHeavy {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes pulseLight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse-heavy {
          animation: pulseHeavy 1.8s ease-in-out infinite;
        }
        .animate-pulse-light {
          animation: pulseLight 1.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Offline Alert Top Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-6 py-2.5 flex items-center justify-center gap-3 text-xs font-bold shadow-2xl select-none transition-all duration-300 animate-slide-down">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </div>
          <WifiOff className="h-4.5 w-4.5 animate-bounce-slow shrink-0" />
          <span>You’re offline. Please check your internet connection.</span>
        </div>
      )}

      {/* Floating global stack of error toasts */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <div className="flex flex-col gap-3.5 items-end w-full pointer-events-auto">
          {globalAlerts.map((alert) => (
            <ToastItem 
              key={alert.id}
              alert={alert}
              onClose={() => removeGlobalAlert(alert.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
