import Link from "next/link";
import type { Metadata } from "next";
import LandingDemo from "@/components/generator/LandingDemo";
import BeforeAfter from "@/components/marketing/BeforeAfter";
import FounderGuarantee from "@/components/marketing/FounderGuarantee";
import FaqSection from "@/components/marketing/FaqSection";
import RoadmapTeaser from "@/components/marketing/RoadmapTeaser";
import PricingTable from "@/components/marketing/PricingTable";
import LaunchBanner from "@/components/marketing/LaunchBanner";

export const metadata: Metadata = {
  title: "ReplyAI — Reply to Google reviews in seconds",
  description:
    "Generate professional replies to your Google reviews with AI. Protect your reputation, save time, boost local SEO.",
};

const BUSINESS_TYPES = [
  "Restaurants",
  "Dental clinics",
  "Real estate agencies",
  "Hotels",
  "Auto shops",
  "Hair salons",
];

export default function LandingPageEN() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <LaunchBanner locale="en" />
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl italic">ReplyAI</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="font-body text-sm text-ink/50 hover:text-ink">
            ES
          </Link>
          <Link href="/login" className="font-body text-sm text-ink/70 hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Try it free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <p className="mb-5 font-body text-sm uppercase tracking-[0.2em] text-clay">
          Local reputation · Powered by AI
        </p>
        <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
          Reply to your Google reviews
          <br />
          <span className="italic text-clay">in 10 seconds</span>, not 10 minutes.
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-body text-lg text-ink/70">
          ReplyAI writes professional, warm, human replies to every review your
          business gets. No robotic templates. No staring at a blank box in
          front of a bad review.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary">
            Try it free — no card required
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            See how it works
          </a>
        </div>
        <p className="mt-4 font-body text-xs text-ink/40">
          {BUSINESS_TYPES.join(" · ")}
        </p>
      </section>

      {/* Public demo */}
      <section className="mx-auto max-w-2xl px-6 pb-20">
        <LandingDemo locale="en" />
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Reputation",
              text: "Every reply builds trust and shows someone actually cares about your business.",
            },
            {
              title: "Time",
              text: "Stop improvising replies from scratch. Get the 5 best variants in one click.",
            },
            {
              title: "Local SEO",
              text: "Replies that naturally weave in your business and area, never forced.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-ink/10 bg-white p-7 shadow-card">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-2 font-body text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-4xl">How it works</h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
            { step: "01", title: "Pick your business type", text: "Restaurant, clinic, hotel, shop... tone adapts automatically." },
            { step: "02", title: "Paste the review", text: "Copy the customer's text, positive or negative." },
            { step: "03", title: "Copy your reply", text: "5 different tones, ready to paste into Google Business." },
          ].map((item) => (
            <div key={item.step}>
              <span className="font-display text-3xl italic text-clay">{item.step}</span>
              <h3 className="mt-3 font-body text-base font-semibold">{item.title}</h3>
              <p className="mt-1 font-body text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <BeforeAfter locale="en" />

      {/* Founder's guarantee — honest, no invented testimonials */}
      <FounderGuarantee locale="en" />

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center font-display text-4xl">Simple pricing</h2>
        <p className="mt-3 text-center font-body text-ink/60">
          Start free. Upgrade whenever you need to.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-card">
            <h3 className="font-display text-2xl">Free</h3>
            <p className="mt-2 font-display text-4xl">$0</p>
            <p className="font-body text-sm text-ink/50">20 replies per month</p>
            <ul className="mt-6 space-y-2 font-body text-sm text-ink/70">
              <li>✓ 5 tones per review</li>
              <li>✓ Every business type</li>
              <li>✓ Basic history</li>
            </ul>
            <Link href="/signup" className="btn-secondary mt-8 w-full">
              Start for free
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-clay bg-white p-8 shadow-card">
            <span className="rounded-full bg-clay/10 px-3 py-1 font-body text-xs font-semibold text-clay">
              MOST POPULAR
            </span>
            <h3 className="mt-3 font-display text-2xl">Pro</h3>
            <p className="mt-2 font-display text-4xl">$19<span className="text-base text-ink/50">/mo</span></p>
            <p className="font-body text-sm text-ink/50">Unlimited replies</p>
            <ul className="mt-6 space-y-2 font-body text-sm text-ink/70">
              <li>✓ Everything in Free</li>
              <li>✓ Unlimited replies</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/signup" className="btn-primary mt-8 w-full">
              Start with Pro
            </Link>
          </div>
        </div>
        <PricingTable locale="en" />
        <RoadmapTeaser locale="en" />
      </section>

      {/* FAQ */}
      <FaqSection locale="en" />

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="font-display text-4xl">
          Your next review deserves <span className="italic text-clay">a good reply</span>.
        </h2>
        <Link href="/signup" className="btn-primary mt-8 inline-flex">
          Try ReplyAI for free
        </Link>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        <Link href="/privacy" className="hover:text-ink/70">Privacy</Link>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
