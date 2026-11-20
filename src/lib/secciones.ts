// src/lib/secciones.ts — secciones del inicio (vienen de /api/secciones, se editan en Admin > Inicio)
export type EstiloPromo = "naranja" | "indigo" | "amarillo" | "claro";

export type DatosPromo = {
  etiqueta: string | null;
  subtitulo: string | null;
  texto: string | null;
  imagen_url: string | null;
  boton_texto: string | null;
  boton_enlace: string | null;
  estilo: EstiloPromo;
  fecha_evento: string | null; // "2026-12-20 20:00" -> cuenta regresiva
};

export type Seccion = {
  id: number;
  clave: string | null; // SISTEMA: tienda, vitrina, aliados, noticias, servicio, videos, boletin, redes
  tipo: "SISTEMA" | "PROMO";
  titulo: string;
  activo?: boolean;
  orden: number;
  datos: DatosPromo | null;
  desde: string | null;
  hasta: string | null;
};

/** Orden por defecto si la API no responde (el inicio nunca queda en blanco) */
export const SECCIONES_POR_DEFECTO: Seccion[] = ["tienda", "vitrina", "aliados", "noticias", "servicio", "videos", "boletin", "redes"].map((clave, i) => ({
  id: -(i + 1),
  clave,
  tipo: "SISTEMA",
  titulo: clave,
  orden: i,
  datos: null,
  desde: null,
  hasta: null,
}));

export const DESCRIPCION_SISTEMA: Record<string, string> = {
  tienda: "Titular naranja con el buscador y las categorías en círculos",
  vitrina: "Productos recomendados por los aliados",
  aliados: "Tarjetas de Puntos Aliados + llamado para nuevos negocios",
  noticias: "La noticia más reciente en grande y las siguientes",
  servicio: "Pico y Placa + Programación del canal",
  videos: "Últimas noticias con video",
  boletin: "Formulario \"No te pierdas ninguna noticia\"",
  redes: "Tarjetas de Facebook, Instagram y TikTok",
  referidos: "Programa Refiere y gana: reto del día y botón para obtener el enlace",
  facebook: "Publicaciones de la página de Facebook en vivo",
};
