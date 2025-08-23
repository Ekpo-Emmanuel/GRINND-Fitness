import Link from "next/link";
import { ArrowRight, Dumbbell, Target, Clock, TrendingUp, FileText } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Dumbbell,
    title: "Custom Workouts",
    description: "Build and save your own workout routines"
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Monitor your gains and performance over time"
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Detailed insights into your training data"
  },
  {
    icon: FileText,
    title: "Notes",
    description: "Add detailed notes to workouts and exercises"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)] flex justify-center">
      <section className="relative overflow-hidden max-w-5xl ">        
        <div className="relative mx-auto px-4 py-20 lg:py-32">
            <Logo className="text-2xl mb-5 text-[var(--ds-on-accent)]" />
          <div className=" space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-9xl font-extrabold text-[var(--ds-text-primary)] tracking-tight">
                Serious tracking for serious gym workouts
              </h1>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0  mt-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex flex-col items-center space-y-2 px-2  border-r border-[var(--ds-border)] transition-colors duration-200"
                  >
                    <div className="p-3 rounded-full flex items-center justify-center w-fit">
                      <IconComponent size={44}  className="text-[var(--ds-border)]" />
                    </div>
                    <span className="text-lg tracking-tight font-medium text-[var(--ds-text-primary)]/50">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="mt-12">
              <Link 
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-[var(--ds-radius-full)] bg-[var(--ds-text-primary)] text-[var(--ds-bg-primary)] font-semibold text-lg transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust Indicators */}
            {/* <div className="mt-16 pt-8 border-t border-[var(--ds-border)]">
              <p className="text-sm text-[var(--ds-text-muted)] mb-4">Trusted by athletes worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-2xl font-bold text-[var(--ds-text-secondary)]">10K+</div>
                <div className="text-2xl font-bold text-[var(--ds-text-secondary)]">•</div>
                <div className="text-2xl font-bold text-[var(--ds-text-secondary)]">500K+</div>
                <div className="text-2xl font-bold text-[var(--ds-text-secondary)]">•</div>
                <div className="text-2xl font-bold text-[var(--ds-text-secondary)]">4.9★</div>
              </div>
              <p className="text-xs text-[var(--ds-text-muted)] mt-2">Active Users • Workouts Completed • App Store Rating</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-[var(--ds-surface-elevated)] border-t border-[var(--ds-border)] py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[var(--ds-text-secondary)] text-sm">
            © 2024 GRND Fitness. Built for serious athletes.
          </p>
        </div>
      </footer> */}
    </div>
  );
}
