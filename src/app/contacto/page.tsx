// src/app/contacto/page.tsx
"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Por ahora simulado — más adelante conectamos a un endpoint real (email o base de datos)
    setSent(true);
  };

  return (
    <main className="flex-1 bg-gray-50">
      {/* Encabezado de la página */}
      <section className="fondo-marca py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Contáctanos
        </h1>
        <p className="text-white/90 mt-3 max-w-xl mx-auto px-4">
          ¿Tienes una noticia, una alianza comercial o alguna duda? Escríbenos,
          te responderemos lo antes posible.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario */}
        <div>
          <h2 className="text-xl font-bold text-indigo mb-6">
            Envíanos un mensaje
          </h2>

          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-6 text-center">
              <p className="font-bold">¡Mensaje enviado!</p>
              <p className="text-sm mt-1">
                Gracias por escribirnos, te contactaremos pronto.
              </p>
            </div>
          ) : (
            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input suppressHydrationWarning
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input suppressHydrationWarning
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea suppressHydrationWarning
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo resize-none"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-naranja hover:bg-naranja-oscuro text-white font-bold py-3 rounded-lg transition-colors"
              >
                <Send size={18} /> Enviar mensaje
              </button>
            </form>
          )}
        </div>

        {/* Info de contacto */}
        <div>
          <h2 className="text-xl font-bold text-indigo mb-6">
            Información de contacto
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="text-naranja mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-800">Ubicación</p>
                <p className="text-gray-500 text-sm">
                  Cúcuta, Norte de Santander, Colombia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-naranja mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-800">Teléfono / WhatsApp</p>
                <p className="text-gray-500 text-sm">+57 310 851 1162</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-naranja mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-800">Correo</p>
                <p className="text-gray-500 text-sm">
                  canaltvfrontera@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-naranja mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-800">Transmisión</p>
                <p className="text-gray-500 text-sm">En vivo, 24/7</p>
              </div>
            </div>
          </div>

          {/* Mapa embebido */}
          <div className="mt-8 rounded-xl overflow-hidden shadow-md border border-gray-200">
            <iframe
              src="https://www.google.com/maps?q=Cúcuta,+Norte+de+Santander,+Colombia&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
