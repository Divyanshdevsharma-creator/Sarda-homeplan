"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  ExternalLink,
  X,
  Copy,
  Check,
  Sparkles,
  User,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface EmailCustomerTarget {
  id: string;
  full_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  village_city?: string | null;
  district?: string | null;
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: EmailCustomerTarget | null;
  onEmailSaved?: (customerId: string, email: string) => void;
}

type TemplateKey = "consultation" | "site_visit" | "blueprints" | "payment" | "custom";

export default function SendEmailModal({
  isOpen,
  onClose,
  customer,
  onEmailSaved,
}: SendEmailModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("consultation");
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const supabase = createClient();

  // Load existing or stored email and apply default template on customer open
  useEffect(() => {
    if (!customer) return;

    const cleanMobile = customer.mobile ? customer.mobile.replace(/\D/g, "").slice(-10) : "";
    let existingEmail = customer.email || "";

    if (!existingEmail && typeof window !== "undefined") {
      existingEmail =
        localStorage.getItem(`sarda_cust_email_${customer.id}`) ||
        (cleanMobile ? localStorage.getItem(`sarda_cust_email_${cleanMobile}`) : "") ||
        "";
    }

    setRecipientEmail(existingEmail);
    setEmailError("");
    setSaveSuccess(false);
    applyTemplate("consultation", customer);
  }, [customer]);

  const applyTemplate = (templateKey: TemplateKey, target = customer) => {
    setSelectedTemplate(templateKey);
    const clientName = target?.full_name ? target.full_name.trim() : "Client";

    switch (templateKey) {
      case "consultation":
        setSubject(`Sarda Homeplan — House Plan & Architectural Consultation for ${clientName}`);
        setBody(
          `Namaste ${clientName} ji,\n\n` +
          `Thank you for reaching out to Sarda Homeplan for your dream home architectural planning.\n\n` +
          `We would like to connect with you regarding your plot dimensions, layout requirements, and architectural design preferences. Please let us know a suitable time for consultation, or reply to this email directly.\n\n` +
          `You can also reach our principal designer directly at +91 9918833851.\n\n` +
          `Warm regards,\n` +
          `Dinesh Kumar Sharma\n` +
          `Sarda Homeplan (Architectural Planning & Vastu)\n` +
          `Phone: +91 9918833851\n` +
          `Office: Pratapgarh / Prayagraj\n` +
          `Website: https://sardahomeplan.com`
        );
        break;

      case "site_visit":
        setSubject(`Sarda Homeplan — Site Visit Confirmation for ${clientName}`);
        setBody(
          `Namaste ${clientName} ji,\n\n` +
          `Regarding your site visit request with Sarda Homeplan, our team is ready to conduct the on-site plot survey and architectural inspection.\n\n` +
          `Please confirm your exact plot location and convenient time so we can lock in the date and complete the soil, boundary, and road orientation assessment.\n\n` +
          `Warm regards,\n` +
          `Dinesh Kumar Sharma\n` +
          `Sarda Homeplan\n` +
          `Phone: +91 9918833851\n` +
          `Website: https://sardahomeplan.com`
        );
        break;

      case "blueprints":
        setSubject(`Sarda Homeplan — Your Architectural House Blueprints are Ready`);
        setBody(
          `Namaste ${clientName} ji,\n\n` +
          `We are delighted to inform you that your customized architectural house plans and detailed blueprints have been prepared by our design team.\n\n` +
          `Please review the design layout and let us know if you would like any revisions or additions before final delivery.\n\n` +
          `Warm regards,\n` +
          `Dinesh Kumar Sharma\n` +
          `Head Architect, Sarda Homeplan\n` +
          `Phone: +91 9918833851\n` +
          `Website: https://sardahomeplan.com`
        );
        break;

      case "payment":
        setSubject(`Sarda Homeplan — Project Advance & Work Commencement for ${clientName}`);
        setBody(
          `Namaste ${clientName} ji,\n\n` +
          `This email confirms the discussion regarding the advance payment and official project onboarding for your architectural house plan.\n\n` +
          `We sincerely appreciate your trust in Sarda Homeplan and look forward to designing a beautiful, compliant, and comfortable home for your family.\n\n` +
          `Warm regards,\n` +
          `Dinesh Kumar Sharma\n` +
          `Sarda Homeplan\n` +
          `Phone: +91 9918833851`
        );
        break;

      case "custom":
        setSubject(`Sarda Homeplan — Direct Message for ${clientName}`);
        setBody(`Namaste ${clientName} ji,\n\n\n\nWarm regards,\nDinesh Kumar Sharma\nSarda Homeplan`);
        break;
    }
  };

  const validateAndPersistEmail = async (): Promise<boolean> => {
    const trimmed = recipientEmail.trim();
    if (!trimmed) {
      setEmailError("Please enter the customer's email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com).");
      return false;
    }

    setEmailError("");

    // Persist in localStorage immediately
    if (customer && typeof window !== "undefined") {
      const cleanMobile = customer.mobile ? customer.mobile.replace(/\D/g, "").slice(-10) : "";
      localStorage.setItem(`sarda_cust_email_${customer.id}`, trimmed);
      if (cleanMobile) {
        localStorage.setItem(`sarda_cust_email_${cleanMobile}`, trimmed);
      }
    }

    // Try updating Supabase public.customer_profiles
    if (customer?.id) {
      try {
        await supabase
          .from("customer_profiles")
          .update({ email: trimmed })
          .eq("id", customer.id);
      } catch (_) {
        // Fallback gracefully if schema column not yet migrated
      }

      if (onEmailSaved) {
        onEmailSaved(customer.id, trimmed);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    return true;
  };

  // 1. Send via Gmail (Opens Gmail Web compose with fields pre-filled)
  const handleSendViaGmail = async () => {
    const isValid = await validateAndPersistEmail();
    if (!isValid) return;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail.trim()
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  // 2. Open via Default Mail Client (mailto:)
  const handleOpenMailClient = async () => {
    const isValid = await validateAndPersistEmail();
    if (!isValid) return;

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  };

  // 3. Copy Email Text
  const handleCopyText = async () => {
    const fullText = `To: ${recipientEmail.trim()}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  };

  if (!isOpen || !customer) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#d8d0c2] bg-white shadow-2xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#ece6db] bg-[#faf8f4] px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#063b2c] text-[#f4cf72] shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#17221b]">
                  Direct Email to Customer
                </h3>
                <span className="rounded-full bg-[#e8f5ec] px-2.5 py-0.5 text-[10px] font-bold text-[#0c7a62]">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-black/55">
                Owner direct communication to {customer.full_name || "Customer"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-black/40 hover:bg-black/5 hover:text-black transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* CUSTOMER BRIEF BANNER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdF] bg-[#f5f1e8] px-6 py-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#17221b]">
            <User size={13} className="text-[#063b2c]" />
            <span>{customer.full_name || "Registered Customer"}</span>
          </div>

          {customer.mobile && (
            <div className="flex items-center gap-1.5 text-black/65">
              <Phone size={13} className="text-[#063b2c]" />
              <span>+91 {customer.mobile}</span>
            </div>
          )}

          {(customer.village_city || customer.district) && (
            <div className="flex items-center gap-1.5 text-black/65">
              <MapPin size={13} className="text-[#063b2c]" />
              <span>
                {customer.village_city || ""}{customer.village_city && customer.district ? ", " : ""}{customer.district || ""}
              </span>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
          {/* RECIPIENT EMAIL INPUT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold uppercase tracking-wider text-[11px] text-black/70 flex items-center gap-1.5">
                <span>Customer Email Address</span>
                <span className="text-red-500">*</span>
              </label>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c7a62]">
                  <Check size={12} />
                  <span>Saved to Profile</span>
                </span>
              )}
            </div>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
              />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="Enter customer email (e.g. customer@gmail.com)"
                className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-xs font-semibold text-[#17221b] outline-none transition placeholder:text-black/40 ${
                  emailError
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                    : "border-[#ded9cf] focus:border-[#063b2c] focus:ring-1 focus:ring-[#063b2c]"
                }`}
              />
            </div>
            {emailError ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-600">
                <AlertCircle size={12} />
                <span>{emailError}</span>
              </p>
            ) : (
              <p className="mt-1 text-[10.5px] text-black/45">
                Will be automatically remembered and saved to this customer&apos;s record for future emails.
              </p>
            )}
          </div>

          {/* TEMPLATE PICKER */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-[11px] text-black/70 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#9b7732]" />
              <span>Select Pre-Composed Template</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { key: "consultation", label: "House Plan Consultation" },
                { key: "site_visit", label: "Site Visit Survey" },
                { key: "blueprints", label: "Blueprints Ready" },
                { key: "custom", label: "Custom Message" },
              ].map((tpl) => (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => applyTemplate(tpl.key as TemplateKey)}
                  className={`rounded-xl border px-3 py-2 text-center text-[11px] font-bold transition cursor-pointer ${
                    selectedTemplate === tpl.key
                      ? "border-[#063b2c] bg-[#063b2c] text-[#f4cf72] shadow-sm"
                      : "border-[#ded9cf] bg-[#faf8f4] text-[#17221b] hover:bg-[#ede7da]"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUBJECT INPUT */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-[11px] text-black/70 mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="h-10 w-full rounded-xl border border-[#ded9cf] bg-white px-3 text-xs font-semibold text-[#17221b] outline-none transition focus:border-[#063b2c]"
            />
          </div>

          {/* MESSAGE BODY TEXTAREA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold uppercase tracking-wider text-[11px] text-black/70">
                Message Content
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#063b2c] hover:underline cursor-pointer"
              >
                {copied ? <Check size={12} className="text-[#0c7a62]" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message to the customer..."
              className="w-full rounded-xl border border-[#ded9cf] bg-white p-3 font-sans text-xs leading-relaxed text-[#17221b] outline-none transition focus:border-[#063b2c] resize-y"
            />
          </div>
        </div>

        {/* MODAL FOOTER WITH TWO INSTANT SEND OPTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#ece6db] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2 text-black/50 text-[11px]">
            <FileText size={13} className="text-[#063b2c]" />
            <span>Sends directly from Dinesh Kumar Sharma (Admin)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded9cf] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#f4efe8] transition cursor-pointer"
            >
              Cancel
            </button>

            {/* SEND VIA GMAIL (PRIMARY IN BROWSER) */}
            <button
              type="button"
              onClick={handleSendViaGmail}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#EA4335] px-4.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#d93025] transition cursor-pointer"
              title="Open draft directly in Gmail Web"
            >
              <Send size={13} />
              <span>Send via Gmail</span>
              <ExternalLink size={12} className="opacity-80" />
            </button>

            {/* OPEN VIA DEFAULT MAIL CLIENT */}
            <button
              type="button"
              onClick={handleOpenMailClient}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4.5 py-2 text-xs font-bold text-[#f4cf72] shadow-sm hover:bg-[#0a4d38] transition cursor-pointer"
              title="Launch default system mail application"
            >
              <Mail size={13} />
              <span>Open in Mail App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
