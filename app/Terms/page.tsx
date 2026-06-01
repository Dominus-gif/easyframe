import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - EasyFrame",
  description: "Terms of Service for EasyFrame.app."
};

const sections = [
  {
    title: "Agreement To These Terms",
    body: [
      "By accessing or using EasyFrame, you agree to these Terms of Service. If you do not agree, do not use the app.",
      "EasyFrame provides tools for creating screenshot mockups, social frames, device previews, and related visual assets."
    ]
  },
  {
    title: "Accounts",
    body: [
      "You may need to sign in with an authentication provider to use the studio, start a trial, export assets, or manage your plan. You are responsible for keeping your account secure and for activity that occurs under your account."
    ]
  },
  {
    title: "Trials, Plans, And Billing",
    body: [
      "EasyFrame may offer a limited free trial. Trial length, export limits, and available features may change over time. After a trial ends or its export limit is reached, continued use may require a paid plan.",
      "Paid plans, including monthly and lifetime access, are processed through our payment provider. Prices, plan names, features, and availability may be updated as the product evolves. Any recurring plan remains subject to the payment provider's billing and cancellation flow."
    ]
  },
  {
    title: "Your Content",
    body: [
      "You are responsible for the images, screenshots, text, logos, and other content you upload or create with EasyFrame. You must have the rights needed to use that content.",
      "You may not upload or create content that is illegal, harmful, abusive, infringing, deceptive, or designed to misuse the service."
    ]
  },
  {
    title: "Acceptable Use",
    body: [
      "You agree not to interfere with the service, reverse engineer protected parts of the app, bypass access controls, abuse trials, attempt unauthorized access, or use EasyFrame in a way that harms other users, the service, or third-party systems."
    ]
  },
  {
    title: "Intellectual Property",
    body: [
      "EasyFrame, including its interface, brand, software, design systems, and product experience, is owned by EasyFrame or its licensors. These Terms do not transfer ownership of EasyFrame to you.",
      "You keep ownership of content you upload, subject to the rights you grant us to operate the service and render your mockups."
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
      updated="May 31, 2026"
      intro="These Terms explain the rules for using EasyFrame, including accounts, trials, plans, content, and acceptable use."
      sections={sections}
    />
  );
}
