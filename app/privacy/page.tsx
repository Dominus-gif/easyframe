import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - EasyFrame",
  description: "How EasyFrame handles your data: images are processed in your browser and never stored, plus how we use advertising and analytics.",
  alternates: {
    canonical: "https://www.easyframe.app/privacy"
  }
};

const sections = [
  {
    title: "Your Images Stay In Your Browser",
    body: [
      "This is the most important thing to know: all mockup compositing happens locally in your browser using the Canvas API. Images you upload are never sent to, processed by, or stored on our servers. Because your screenshots never leave your device, there is nothing for us to store, share, or lose.",
      "Saved projects (a Premium feature that requires an account) are the only exception; where offered, they are stored account-scoped and encrypted at rest."
    ]
  },
  {
    title: "Information We Collect",
    body: [
      "The free tool requires no account, and we do not collect your images. If you create an account — only needed to purchase Premium or save projects — we collect basic profile information from your sign-in provider (such as name, email, and profile image), along with records needed to run your plan (subscription status, plan type, and export counts).",
      "You should avoid uploading sensitive, confidential, or illegal content."
    ]
  },
  {
    title: "Advertising",
    body: [
      "We show display advertising through Google AdSense to keep EasyFrame free. Google and its partners may use cookies and device identifiers to serve and measure ads, including personalized advertising where permitted by law.",
      "Advertising cookies load only after you accept them in our cookie banner. You can manage or opt out of personalized ads through Google's Ads Settings. Premium removes ads entirely."
    ]
  },
  {
    title: "Analytics",
    body: [
      "We use Google Analytics 4 to understand aggregate usage — for example, which pages are viewed and how often people upload and export mockups. We never send your image content to analytics. Analytics uses cookies, which load after consent."
    ]
  },
  {
    title: "Cookies And Consent",
    body: [
      "Essential cookies keep you signed in (when you have an account) and remember your preferences. Advertising and analytics cookies are loaded only after you consent through our cookie banner. You can withdraw consent at any time by declining the banner or clearing this site's data in your browser."
    ]
  },
  {
    title: "Authentication And Payments",
    body: [
      "EasyFrame uses third-party services for authentication, database hosting, deployment, advertising, analytics, and payments. Google OAuth may be used for sign-in. Account and plan records may be stored with our database provider. Dodo Payments processes purchases and subscription events.",
      "Payment details are handled by the payment provider. EasyFrame does not store full credit card numbers."
    ]
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell your personal information. We share information only with the service providers that help us operate EasyFrame (authentication, hosting, payments, advertising, and analytics), to comply with legal obligations, to protect the service, or to complete actions you request."
    ]
  },
  {
    title: "Data Retention",
    body: [
      "We do not retain your uploaded images because they are never stored. We keep account, subscription, and payment-event records for as long as needed to provide the service, meet legal obligations, resolve disputes, and maintain accurate billing history."
    ]
  },
  {
    title: "Your Choices",
    body: [
      "You can use the core tool without an account. You can decline advertising and analytics cookies in our banner and manage ad personalization through Google. If you have an account, you may contact us to request access, correction, or deletion of your account information, subject to legal, security, and billing-record requirements."
    ]
  },
  {
    title: "Contact",
    body: [
      "For privacy questions, contact us at contact@easyframe.app. If this contact address changes, we will update this policy."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Privacy at EasyFrame"
      updated="August 20, 2026"
      intro="This Privacy Policy explains what EasyFrame collects and how we use it. In short: your images are processed in your browser and never stored, and advertising and analytics cookies load only after you consent."
      sections={sections}
    />
  );
}
