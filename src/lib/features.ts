// src/lib/features.ts — interruptores de funcionalidades
// Para volver a mostrar el TV en vivo cuando la señal funcione:
//   en .env.local agrega  NEXT_PUBLIC_TV_EN_VIVO=true  y reinicia `npm run dev`.
export const FEATURES = {
  tvEnVivo: process.env.NEXT_PUBLIC_TV_EN_VIVO === "true",
  radio: true,
  // Compra directa por la web (carrito + pedidos en el panel). Mientras esté apagado, los pedidos se hacen
  // por WhatsApp con el mensaje ya escrito. Para activarla: NEXT_PUBLIC_COMPRAS_WEB=true en .env.local
  comprasWeb: process.env.NEXT_PUBLIC_COMPRAS_WEB === "true",
} as const;
