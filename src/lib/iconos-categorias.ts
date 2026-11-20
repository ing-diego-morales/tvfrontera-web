// src/lib/iconos-categorias.ts — íconos que el admin puede elegir para cada categoría
// (la lista de nombres debe coincidir con ICONOS en tvfrontera-api/src/routes/categorias.js)
import {
  Apple, Baby, Bike, BookOpen, Briefcase, Camera, Car, Coffee, CupSoda, Dumbbell, Flower2, Gem, Gift, HeartPulse, Home,
  LayoutGrid, Laptop, Music, PawPrint, Pill, Pizza, Plane, Scissors, Shirt, Smartphone, Store, Footprints, UtensilsCrossed, Wifi, Wrench,
  type LucideIcon,
} from "lucide-react";

export const ICONOS_CATEGORIA: Record<string, { icono: LucideIcon; nombre: string }> = {
  manzana: { icono: Apple, nombre: "Alimentos" },
  cubiertos: { icono: UtensilsCrossed, nombre: "Restaurante" },
  camisa: { icono: Shirt, nombre: "Ropa" },
  celular: { icono: Smartphone, nombre: "Celulares" },
  wifi: { icono: Wifi, nombre: "Internet" },
  carro: { icono: Car, nombre: "Carros" },
  salud: { icono: HeartPulse, nombre: "Salud" },
  casa: { icono: Home, nombre: "Hogar" },
  maletin: { icono: Briefcase, nombre: "Servicios" },
  libro: { icono: BookOpen, nombre: "Educación" },
  grid: { icono: LayoutGrid, nombre: "Varios" },
  cafe: { icono: Coffee, nombre: "Café" },
  pizza: { icono: Pizza, nombre: "Comida rápida" },
  bebida: { icono: CupSoda, nombre: "Bebidas" },
  regalo: { icono: Gift, nombre: "Regalos" },
  joya: { icono: Gem, nombre: "Joyería" },
  zapato: { icono: Footprints, nombre: "Calzado" },
  bebe: { icono: Baby, nombre: "Bebés" },
  mascota: { icono: PawPrint, nombre: "Mascotas" },
  deporte: { icono: Dumbbell, nombre: "Deportes" },
  herramienta: { icono: Wrench, nombre: "Herramientas" },
  flor: { icono: Flower2, nombre: "Flores" },
  computador: { icono: Laptop, nombre: "Computadores" },
  musica: { icono: Music, nombre: "Música" },
  camara: { icono: Camera, nombre: "Fotografía" },
  farmacia: { icono: Pill, nombre: "Farmacia" },
  tienda: { icono: Store, nombre: "Tienda" },
  moto: { icono: Bike, nombre: "Motos" },
  viaje: { icono: Plane, nombre: "Viajes" },
  belleza: { icono: Scissors, nombre: "Belleza" },
};

export const iconoDe = (clave: string | null | undefined) => (ICONOS_CATEGORIA[clave ?? ""] ?? ICONOS_CATEGORIA.grid).icono;

export type Categoria = { id: number; nombre: string; icono: string; aliados?: number; orden?: number; activo?: boolean };
