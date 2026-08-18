"use client";

// TODO: Connect this form to an email delivery service (e.g. EmailJS or Brevo)
// or save submissions to a Firestore "inquiries" collection once that
// integration is ready. For now, submission is handled client-side only.

import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.message.trim()) errors.message = "Message is required.";
  return errors;
}

const EMPTY: FormState = { name: "", email: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // TODO: send form data to email service or Firestore here
    setSubmitted(true);
    setForm(EMPTY);
    setErrors({});
  }

  const inputBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-light flex items-center justify-center text-xl">
          ✓
        </div>
        <p className="font-serif text-xl font-bold text-ink">Message Sent!</p>
        <p className="text-sm text-gray">
          Thanks! We&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs text-rose underline underline-offset-2 hover:text-ink transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          Name <span className="text-rose">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          className={`${inputBase} ${errors.name ? "border-rose" : "border-gray-light"}`}
        />
        {errors.name && <p className="text-xs text-rose">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          Email <span className="text-rose">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={`${inputBase} ${errors.email ? "border-rose" : "border-gray-light"}`}
        />
        {errors.email && <p className="text-xs text-rose">{errors.email}</p>}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          Message <span className="text-rose">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Ask us about sizing, an order, or anything else…"
          className={`${inputBase} resize-none ${errors.message ? "border-rose" : "border-gray-light"}`}
        />
        {errors.message && (
          <p className="text-xs text-rose">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200"
      >
        Send Message
      </button>
    </form>
  );
}
