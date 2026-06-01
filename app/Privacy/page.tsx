import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - EasyFrame",
  description: "Privacy Policy for EasyFrame.app."
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "When you sign in to EasyFrame, we collect basic account information provided by your authentication provider, such as your name, email address, and profile image. We also store app usage details needed to operate the product, including trial status, export count, plan type, and subscription status.",
      "If you upload media to create mockups, that media is used to render your design experience. You should avoid uploading sensitive, confidential, or illegal content."
    ]
  },
  {
    title: "How We Use Information",
    body: [
      "We use your information to provide the EasyFrame studio, authenticate your account, manage free trials, process subscriptions, prevent abuse, and improve the product experience.",
      "We may use account and subscription records to provide support, troubleshoot issues, and understand whether your plan is active."
    ]
  },
  {
    title: "Authentication And Payments",
    body: [
      "EasyFrame uses third-party services for authentication, database hosting, deployment, and payments. Google OAuth may be used for sign-in. Supabase may be used to store account and plan records. Dodo Payments may be used to process purchases and subscription events.",
      "Payment details are handled by the payment provider. EasyFrame does not intentionally store full credit card numbers."
    ]
  },
  {
    title: "Cookies And Sessions",
    body: [
      "We use cookies and similar session technology to keep you signed in, protect authenticated routes, and remember essential app state. Some cookies are required for the service to work."
    ]
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell your personal information. We share information only with service providers that help us operate EasyFrame, comply with legal obligations, protect the service, or complete actions you request."
    ]
  },
  {
    title: "Data Retention",
    body: [
      "We keep account, project, trial, subscription, and payment event records for as long as needed to provide the service, meet legal obligations, resolve disputes, and maintain accurate billing history."
    ]
  },
  {
    title: "Your Choices",
    body: [
      "You can stop using EasyFrame at any time. You may contact us to request access, correction, or deletion of your account information, subject to legal, security, and billing record requirements."
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
      updated="May 31, 2026"
      intro="This Privacy Policy explains what EasyFrame collects, how we use it, and how we protect the information needed to run the app."
      sections={sections}
    />
  );
}
