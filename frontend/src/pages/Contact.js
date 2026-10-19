import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { Reveal } from "../components/motion";
import { PageHeader, Spinner } from "../components/ui";

const CHANNELS = [
  { label: "Phone", value: "+91 6307800255", href: "tel:+916307800255", note: "Mon-Sat, 9AM-9PM" },
  { label: "Email", value: "hm2300439@gmail.com", href: "mailto:hm2300439@gmail.com", note: "24/7 Response" },
  { label: "Office", value: "Ajmera, Pune", note: "Visit by appointment" },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Add your contact form API endpoint here
    setTimeout(() => {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Contact" title={["Say hello."]} lede="We'd love to hear from you." />

      <div className="grid gap-16 lg:grid-cols-12">
        <div className="border-t border-line/10 lg:col-span-6">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06} className="grid grid-cols-3 gap-4 border-b border-line/10 py-8">
              <p className="eyebrow pt-2">{c.label}</p>
              <div className="col-span-2">
                {c.href ? (
                  <a href={c.href} className="display-tight link-underline break-all text-2xl md:text-3xl">
                    {c.value}
                  </a>
                ) : (
                  <p className="display-tight text-2xl md:text-3xl">{c.value}</p>
                )}
                <p className="mt-2 text-sm text-muted">{c.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="form" delay={0.1} onSubmit={handleSubmit} className="space-y-8 lg:col-span-6">
          <p className="eyebrow flex items-center gap-3"><span className="text-accent">(02)</span> Write to us</p>
          <div>
            <label className="field-label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="field-label">Message</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="field resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Spinner /> Sending…
              </>
            ) : (
              <>
                Send message <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
