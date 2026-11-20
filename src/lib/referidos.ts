// src/lib/referidos.ts — tipos del programa "Refiere y gana" (vienen de /api/referidos)
export type Reto = {
  fecha: string;
  activo: boolean;
  premio: string;
  descripcion: string | null;
  referidos_necesarios: number;
  ganadores: number;
  ganadores_actuales?: number;
  es_hoy?: boolean;
  origen?: "SEMANA" | "FECHA";
  dia?: number;
};

export type Meta = {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  referidos_necesarios: number;
  cupo: number | null;
  ganadores: number;
  agotado?: boolean;
  activo?: boolean;
};

export type Programa = {
  activo: boolean;
  requisito: "EMAIL" | "IDENTIDAD" | "COMPRA";
  requisito_texto: string;
  hoy: string;
  reto_hoy: Reto | null;
  semana: Reto[];
  metas: Meta[];
  ranking: { nombre: string; referidos: number }[];
};

export type PremioGanado = { id: number; tipo: "META" | "RETO"; premio: string; posicion: number | null; estado: "PENDIENTE" | "ENTREGADO" | "ANULADO"; fecha_reto: string | null; created_at: string };

export type MisReferidos = {
  codigo: string;
  enlace: string;
  requisito_texto: string;
  total_validos: number;
  hoy_validos: number;
  pendientes: number;
  referidos: { nombre: string; estado: "PENDIENTE" | "VALIDO" | "RECHAZADO"; en_revision: boolean; fecha: string }[];
  premios: PremioGanado[];
};

export const DIAS_SEMANA = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** "2026-11-16" -> "lunes 16 nov" sin corrimiento de zona horaria */
export function fechaCorta(f: string) {
  const [y, m, d] = f.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" });
}
