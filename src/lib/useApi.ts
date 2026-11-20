// src/lib/useApi.ts — carga datos de la API en paneles privados (con cookie de sesión)
// Mantiene los datos anteriores mientras recarga: la pantalla no parpadea al filtrar o guardar.
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, mensajeError } from "./api";

type Estado<T> = { clave: string; data?: T; error?: string };

export function useApi<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState<Estado<T>>({ clave: "" });
  const clave = `${path}#${version}`;

  useEffect(() => {
    if (!path) return;
    let vivo = true;
    api<T>(path, { cache: "no-store" })
      .then((data) => vivo && setEstado({ clave, data }))
      .catch((e) => vivo && setEstado((prev) => ({ clave, data: prev.data, error: mensajeError(e) })));
    return () => {
      vivo = false;
    };
  }, [path, clave]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: estado.data,
    error: estado.clave === clave ? estado.error : undefined,
    cargando: !!path && estado.data === undefined && !estado.error,
    actualizando: !!path && estado.clave !== clave,
    recargar,
  };
}
