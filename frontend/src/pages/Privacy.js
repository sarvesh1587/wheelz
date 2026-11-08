import React from "react";
import { Reveal } from "../components/motion";
import { PageHeader } from "../components/ui";

const UPDATED = "8 November 2026";

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "Account details you give us: name, email, phone number and password (stored hashed). If you sign in with Google we receive your name, email and profile photo.",
      "Identity checks (KYC) for renting or listing: driving licence and ID details and the documents you upload.",
      "Vendor details if you list vehicles: business name, GST and PAN, address and bank account for payouts. Aadhaar, PAN and bank account numbers are encrypted at rest.",
      "Bookings and trips: vehicle, dates, pickup location, amounts and reviews you write.",
      "Payments are processed by Razorpay. We store the payment and order IDs, never your card or UPI details.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To run your account, confirm bookings, take payments and let owners and renters contact each other for a trip.",
      "To send emails you need: welcome, booking, payment receipt, ride confirmation, cancellation and vendor approval emails.",
      "To prevent fraud and misuse, for example by checking identity documents and unusual booking patterns.",
    ],
  },
  {
    title: "Who we share it with",
    body: [
      "The other side of a booking: the vehicle owner sees the renter's name and phone, and the renter sees the owner's name and phone.",
      "Service providers that run Wheelz for us: Razorpay (payments), Google (sign-in and sending email), our hosting and database providers.",
      "Authorities when the law requires it. We do not sell your data or share it for advertising.",
    ],
  },
  {
    title: "Google user data",
    body: [
      "Google sign-in is used only to create and log in to your Wheelz account.",
      "Wheelz uses the Gmail API only to send transactional emails from the Wheelz account (hm2300439@gmail.com). It does not read, store or share anyone's Gmail messages. Use of data from Google APIs follows the Google API Services User Data Policy, including its Limited Use requirements.",
    ],
  },
  {
    title: "Retention and your choices",
    body: [
      "We keep your data while your account is active and as long as needed for bookings, payments and legal records.",
      "You can update your profile at any time. To delete your account or get a copy of your data, email us and we will respond within 30 days.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Legal" title={["Privacy policy."]} lede={`How Wheelz handles your data. Last updated ${UPDATED}.`} />

      <div className="max-w-3xl border-t border-line/10">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.04} className="border-b border-line/10 py-8">
            <h2 className="display-tight mb-4 text-2xl md:text-3xl">{s.title}</h2>
            <ul className="space-y-3 text-muted">
              {s.body.map((p) => (
                <li key={p} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          </Reveal>
        ))}
        <Reveal className="py-8">
          <h2 className="display-tight mb-4 text-2xl md:text-3xl">Contact</h2>
          <p className="leading-relaxed text-muted">
            Questions about this policy or your data:{" "}
            <a href="mailto:hm2300439@gmail.com" className="link-underline text-ink">hm2300439@gmail.com</a>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
