"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Orders are usually processed within 3 to 5 business days, and delivery depends on your location. Major cities often receive orders in 2 to 4 business days, while other areas may take 3 to 7 business days."
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes. We offer Cash on Delivery across most areas in Pakistan. Please make sure someone is available to receive and pay for the order."
  },
  {
    question: "Are shipping charges included?",
    answer: "Shipping charges are calculated at checkout. We may also offer free delivery on selected items or promotional offers."
  },
  {
    question: "How can I contact support?",
    answer: "You can contact us via WhatsApp, phone, or email. Our team responds as quickly as possible during working hours."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.35em] text-black/45 sm:text-sm">FAQ</p>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Frequently Asked Questions</h2>

        <div className="mt-6 space-y-3 sm:mt-8">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="overflow-hidden rounded-[1.5rem] border border-black/15 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="text-base font-semibold text-black sm:text-lg">{faq.question}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/15 transition ${open ? "bg-black text-white" : "bg-white text-black"}`}>
                    <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 pt-0 text-sm leading-7 text-black/65 sm:px-6 sm:text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
