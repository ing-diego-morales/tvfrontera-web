// src/components/LivePlayer.tsx
"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";

const EMBED_URL = "https://cloud5.livescast.com:2020/VideoPlayer/tvfrontera?autoplay=1";

export default function LivePlayer() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-indigo bg-black relative">
      <div className="aspect-video w-full">
        <iframe
          key={reloadKey}
          src={EMBED_URL}
          className="w-full h-full"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          frameBorder={0}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="bg-naranja text-white text-sm font-bold px-3 py-1 flex items-center gap-2 w-fit rounded-tr-md">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> EN VIVO
        </div>

        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1 m-1 rounded-full flex items-center gap-1 transition-colors"
        >
          <RotateCw size={12} /> ¿No carga? Reintentar
        </button>
      </div>
    </div>
  );
}