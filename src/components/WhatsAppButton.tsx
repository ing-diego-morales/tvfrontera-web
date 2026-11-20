// src/components/WhatsAppButton.tsx
import { MessageCircle } from "lucide-react";

import { SITIO } from "@/lib/sitio";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${SITIO.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Contáctanos por WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
}