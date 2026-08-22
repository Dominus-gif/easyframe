import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - EasyFrame",
  description: "Terms of Service for EasyFrame.app — free and Premium tiers, output licensing, and refunds.",
  alternates: {
    canonical: "https://www.easyframe.app/terms"
  }
};

const sections = [
  {
    title: "Agreement To These Terms",
    body: [
      "By accessing or using EasyFrame, you agree to these Terms of Service. If you do not agree, do not use the app.",
      "EasyFrame provides tools for creating device mockups, screenshot frames, and related visual assets, primarily in your browser."
    ]
  },
  {
    title: "Free And Premium Plans",
    body: [
      "The core mockup tool is free and unlimited, with no account required. The free tier is supported by display advertising and includes standard export up to 2048px.",
      "Premium is an optional paid upgrade — by default $6 per month or a one-time $99 for lifetime access (prices, plan names, and features may change). Premium removes ads and unlocks features such as 4K export, transparent-background exports, custom background uploads, batch export, and saved projects. Premium requires an account and is processed through our payment provider, Dodo Payments."
    ]
  },
  {
    title: "Refunds And Cancellation",
    body: [
      "One-time (lifetime) Premium purchases are refundable within 14 days of purchase — contact us at contact@easyframe.app to request a refund.",
      "Monthly Premium can be cancelled at any time through the payment provider's flow; access continues until the end of the current billing period, and partial periods are not refunded."
    ]
  },
  {
    title: "Your Content And Output",
    body: [
      "You are responsible for the images, screenshots, text, and logos you upload or create with EasyFrame, and you must have the rights needed to use that content.",
      "You own the mockups you export. EasyFrame claims no ownership of your output — you may use the images you create for personal or commercial purposes without attribution.",
      "You may not upload or create content that is illegal, harmful, abusive, infringing, or deceptive."
    ]
  },
  {
    title: "Advertising",
    body: [
      "The free tier is supported by advertising. You agree not to block in a fraudulent manner, tamper with, automate, or artificially interact with the ads shown in EasyFrame. Advertising cookies load only after you consent through our cookie banner."
    ]
  },
  {
    title: "Acceptable Use",
    body: [
      "You agree not to interfere with the service, reverse engineer protected parts of the app, bypass access controls, attempt unauthorized access, or use EasyFrame in a way that harms other users, the service, or third-party systems."
    ]
  },
  {
    title: "Intellectual Property",
    body: [
      "EasyFrame — including its interface, brand, software, design systems, and product experience — is owned by EasyFrame or its licensors. These Terms do not transfer ownership of EasyFrame to you.",
      "You keep ownership of the content you upload and the output you create, subject to the limited rights needed to operate the service."
    ]
  },
  {
    title: "Service Changes",
    body: [
      "We may update, improve, limit, suspend, or discontinue parts of EasyFrame as needed. We aim to keep the product reliable, but we do not guarantee uninterrupted or error-free availability."
    ]
  },
  {
    title: "Disclaimers And Liability",
    body: [
      "EasyFrame is provided on an as-is and as-available basis. To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "To the maximum extent permitted by law, EasyFrame will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or business opportunities."
    ]
  },
  {
    title: "Contact",
    body: [
      "For questions about these Terms, contact us at contact@easyframe.app. If this contact address changes, we will update these Terms."
    ]
  }
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Service"
      title="Terms for using EasyFrame"
      updated="August 20, 2026"
      intro="These Terms explain the rules for using EasyFrame, including the free and Premium tiers, ownership of your output, advertising, and refunds."
      sections={sections}
    />
  );
}
