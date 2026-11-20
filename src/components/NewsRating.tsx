// src/components/NewsRating.tsx
"use client";

import { useState, useEffect } from "react";
import { Star, MessageCircle } from "lucide-react";

type Comment = { name: string; text: string; date: string };

export default function NewsRating({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  // Se lee después de montar (localStorage no existe en el servidor)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const storedRating = localStorage.getItem(`rating-${slug}`);
        if (storedRating) setRating(Number(storedRating));
        const storedComments = localStorage.getItem(`comments-${slug}`);
        if (storedComments) setComments(JSON.parse(storedComments));
      } catch {
        /* datos dañados o almacenamiento bloqueado: se ignoran */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [slug]);

  const handleRate = (value: number) => {
    setRating(value);
    localStorage.setItem(`rating-${slug}`, String(value));
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const newComment = { name, text, date: new Date().toLocaleDateString("es-CO") };
    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(`comments-${slug}`, JSON.stringify(updated));
    setName("");
    setText("");
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-bold text-gray-600">Califica esta noticia:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
            >
              <Star
                size={22}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-amarillo text-amarillo"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-indigo" />
        <h3 className="font-bold text-indigo">Comentarios ({comments.length})</h3>
      </div>

      <div className="space-y-3 mb-5">
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-bold text-indigo">{c.name} <span className="text-xs text-gray-400 font-normal">· {c.date}</span></p>
            <p className="text-sm text-gray-600 mt-1">{c.text}</p>
          </div>
        ))}
      </div>

      <form suppressHydrationWarning onSubmit={handleComment} className="space-y-2">
        <input suppressHydrationWarning
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo"
        />
        <textarea suppressHydrationWarning
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo resize-none"
        />
        <button
          type="submit"
          className="bg-indigo text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-oscuro transition-colors"
        >
          Comentar
        </button>
      </form>
    </div>
  );
}