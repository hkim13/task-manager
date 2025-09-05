import Link from "next/link";
import { ArrowUpRight, Check, Clock, Calendar, Zap } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/10 border border-coral-500/20 rounded-full text-coral-400 text-sm font-medium mb-8">
              <Clock className="w-4 h-4" />
              <span>Timeline-Based Task Management</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
              Master Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-orange-400">
                Timeline
              </span>{" "}
              with Visual Task Planning
            </h1>

            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              A sleek, timeline-based task management app that displays your
              daily activities along a vertical timeline with customizable task
              details and durations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-slate-900 bg-coral-500 rounded-lg hover:bg-coral-400 transition-colors text-lg font-medium shadow-lg"
              >
                Start Planning Today
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center px-8 py-4 text-white bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-lg font-medium"
              >
                See Features
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-coral-400" />
                <span>Visual timeline interface</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-coral-400" />
                <span>Quick duration presets</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-coral-400" />
                <span>Dark mode optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
