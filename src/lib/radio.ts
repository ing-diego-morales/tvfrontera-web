// src/lib/radio.ts — datos de la radio en un solo lugar
// Si el proveedor cambia la dirección de la transmisión, solo se edita aquí.
const STREAM = "https://radios.mipanel.stream:6910/stream";

export const RADIO = {
  nombre: "Radio TV Frontera",
  /** Transmisión en vivo (Shoutcast, AAC 128 kbps) */
  stream: STREAM,
  /** "Sonando ahora" e historial (JSON público del proveedor) */
  ahoraSuena: `https://player.extassisnetwork.com/api.php?url=${encodeURIComponent(STREAM)}`,
};

/**
 * Convierte el título que manda la radio en algo presentable.
 * Los títulos que son solo números o códigos internos (ej. "1113621225670858") no se muestran.
 */
export function tituloLegible(titulo: string, artista = ""): { titulo: string; artista: string } | null {
  const t = titulo.replace(/\s+/g, " ").trim();
  if (!t || /^[\d\s_.-]+$/.test(t)) return null;
  // Muchos servidores mandan "Artista - Canción" en un solo campo
  if (!artista && t.includes(" - ")) {
    const [a, ...resto] = t.split(" - ");
    return { titulo: resto.join(" - ").trim(), artista: a.trim() };
  }
  return { titulo: t, artista: artista.trim() };
}
