// src/components/aliado/tipos.ts — perfil completo del aliado logueado (GET /api/socios/me)
export type PerfilAliado = {
  id: number;
  slug: string;
  nombre_negocio: string;
  descripcion: string | null;
  categoria: string | null;
  ciudad: string;
  direccion: string | null;
  whatsapp: string | null;
  telefono: string | null;
  horario: string | null;
  instagram: string | null;
  facebook: string | null;
  logo_url: string | null;
  estado: "PENDIENTE" | "APROBADO" | "SUSPENDIDO";
  plan: "BASICO" | "PREMIUM";
  prioridad: number;
  destacado_hasta: string | null;
  pagado_hasta: string | null;
  vigente: boolean;
};

export type RespuestaPerfil = { perfil: PerfilAliado; motivo: string | null };
