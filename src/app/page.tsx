import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  Clock,
  Calendar,
  Repeat,
  CheckCircle2,
  Zap,
  Layers,
  Timer,
  BarChart3,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-slate-800" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Powerful Timeline Features
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Everything you need to visualize, plan, and execute your daily
              tasks with precision and style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Visual Timeline",
                description:
                  "See your day at a glance with time blocks and duration indicators",
              },
              {
                icon: <Timer className="w-6 h-6" />,
                title: "Quick Presets",
                description:
                  "15m, 30m, 45m, 1hr duration presets for efficient task planning",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                title: "Task Categories",
                description:
                  "Organize with Planned vs Inbox categories and custom icons",
              },
              {
                icon: <Repeat className="w-6 h-6" />,
                title: "Smart Repetition",
                description:
                  "Set up recurring tasks with flexible repetition options",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <div className="text-coral-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Management Showcase */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Comprehensive Task Creation
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Create detailed tasks with all the information you need - from
                basic titles to complex subtasks and notes.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-coral-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-coral-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Rich Task Details
                    </h3>
                    <p className="text-slate-300">
                      Add titles, durations, dates, times, and detailed notes to
                      every task
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-coral-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-coral-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Subtask Management
                    </h3>
                    <p className="text-slate-300">
                      Break down complex tasks into manageable subtasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-coral-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-coral-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Flexible Scheduling
                    </h3>
                    <p className="text-slate-300">
                      Set specific dates and times or use quick duration presets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="space-y-4">
                <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                <div className="flex gap-2 mt-6">
                  <div className="h-8 bg-coral-500/20 rounded px-3 flex items-center text-coral-400 text-sm">
                    15m
                  </div>
                  <div className="h-8 bg-slate-700 rounded px-3 flex items-center text-slate-300 text-sm">
                    30m
                  </div>
                  <div className="h-8 bg-slate-700 rounded px-3 flex items-center text-slate-300 text-sm">
                    1hr
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-coral-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-slate-900">10k+</div>
              <div className="text-slate-800">Tasks Completed Daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-slate-900">95%</div>
              <div className="text-slate-800">Productivity Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-slate-900">24/7</div>
              <div className="text-slate-800">Timeline Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-800" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Choose the perfect plan for your productivity needs. Start free,
              upgrade when ready.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Master Your Timeline?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of productive individuals who've transformed their
            daily planning with our visual timeline approach.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 text-slate-900 bg-coral-500 rounded-lg hover:bg-coral-400 transition-colors text-lg font-medium shadow-lg"
          >
            Start Your Timeline
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
