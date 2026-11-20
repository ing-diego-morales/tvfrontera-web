// src/lib/aliados.ts — tipos y helpers de Puntos Aliados (vienen de /api/socios y /api/productos)
export type AliadoPublico = {
  id: number;
  slug: string;
  nombre_negocio: string;
  descripcion: string | null;
  categoria: string | null;
  ciudad: string;
  logo_url: string | null;
  plan: "BASICO" | "PREMIUM";
  destacado: boolean; // impulso vigente
  verificado: boolean; // identidad verificada (cédula + rostro)
  en_linea: boolean; // actividad en los últimos 5 minutos
  horario: string | null;
  instagram: string | null;
  facebook: string | null;
  total_productos?: number;
  // Solo llegan con sesión iniciada (o si CONTACTO_PUBLICO_ALIADOS=true en la API):
  direccion?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
};

export type ContactoAliado = { whatsapp: string | null; telefono: string | null; direccion: string | null };

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  destacado?: boolean | number;
  // Público: solo disponible / últimas unidades (nunca el número)
  disponible?: boolean | number;
  ultimas?: boolean;
  // Solo en el panel del aliado (/mios):
  stock?: number;
  maneja_stock?: number;
  se_puede_pedir?: number;
  activo?: number;
  created_at?: string;
  // Solo en el catálogo general:
  socio_id?: number;
  socio_slug?: string;
  vendedor?: string;
  socio_plan?: "BASICO" | "PREMIUM";
  socio_destacado?: boolean;
};

export type ListaAliados = {
  restringido: boolean;
  mensaje?: string;
  socios: AliadoPublico[];
  total: number;
  page: number;
  pages: number;
};

export type ListaProductos = { productos: Producto[]; total: number; page: number; pages: number };

export type TiendaAliado = {
  restringido: boolean;
  mensaje?: string;
  socio: AliadoPublico;
  productos: Producto[];
};

export const contactoDe = (a: AliadoPublico): ContactoAliado | null =>
  a.whatsapp || a.telefono || a.direccion ? { whatsapp: a.whatsapp ?? null, telefono: a.telefono ?? null, direccion: a.direccion ?? null } : null;

/** tel: con indicativo de Colombia si viene sin él */
export function telLink(numero: string) {
  let n = numero.replace(/[^\d+]/g, "");
  if (!n.startsWith("+") && n.length === 10) n = `+57${n}`;
  return `tel:${n}`;
}

export const mapaLink = (direccion: string, ciudad: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccion}, ${ciudad}, Colombia`)}`;

export const instagramLink = (usuario: string) => `https://www.instagram.com/${encodeURIComponent(usuario)}`;
