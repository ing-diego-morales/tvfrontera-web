// src/components/SelectorCategoria.tsx — lista de categorías (las que define el admin) para formularios
"use client";

import { Selector } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import type { Categoria } from "@/lib/iconos-categorias";

export default function SelectorCategoria({
  valor,
  onChange,
  name = "categoria",
}: {
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
}) {
  const { data } = useApi<{ categorias: Categoria[] }>("/api/categorias");
  const lista = data?.categorias.map((c) => c.nombre) ?? [];
  return (
    <Selector label="Categoría" name={name} value={valor} onChange={onChange}>
      <option value="">Selecciona...</option>
      {lista.map((c) => (
        <option key={c}>{c}</option>
      ))}
      {/* Si el negocio tiene una categoría que el admin ya ocultó, se sigue mostrando */}
      {valor && !lista.includes(valor) && <option>{valor}</option>}
    </Selector>
  );
}
