// src/lib/rutas.ts
import type { Rol } from "@/components/AuthProvider";

/** A dónde va cada rol después de entrar */
export const inicioPorRol = (rol: Rol) => (rol === "ADMIN" ? "/admin" : rol === "SOCIO" ? "/panel" : "/cuenta");
