// src/app/admin/page.tsx — panel de administración (solo ADMIN; la API lo exige en cada endpoint)
"use client";

import { useState } from "react";
import { Clock, Gift, LayoutDashboard, ScanFace, LayoutTemplate, Tags, CircleHelp, Mail, Megaphone, Newspaper, Receipt, Store, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PanelEncabezado, Pestanas, type Pestana } from "@/components/panel/PanelUI";
import Resumen, { type DatosResumen, type Tab } from "@/components/admin/Resumen";
import AdminAliados from "@/components/admin/AdminAliados";
import AdminUsuarios from "@/components/admin/AdminUsuarios";
import AdminNoticias from "@/components/admin/AdminNoticias";
import AdminPedidos from "@/components/admin/AdminPedidos";
import AdminAvisos from "@/components/admin/AdminAvisos";
import AdminInicio from "@/components/admin/AdminInicio";
import AdminCategorias from "@/components/admin/AdminCategorias";
import AdminPreguntas from "@/components/admin/AdminPreguntas";
import AdminProgramacion from "@/components/admin/AdminProgramacion";
import AdminSuscriptores from "@/components/admin/AdminSuscriptores";
import AdminReferidos from "@/components/admin/AdminReferidos";
import AdminVerificaciones from "@/components/admin/AdminVerificaciones";
import { useApi } from "@/lib/useApi";


export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("resumen");
  // Filtro con el que se abre la pestaña (desde las tarjetas del resumen). "vez" reinicia la vista.
  const [filtro, setFiltro] = useState<{ valor?: string; vez: number }>({ vez: 0 });
  const irA = (t: Tab, valor?: string) => {
    setTab(t);
    setFiltro((f) => ({ valor, vez: f.vez + 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resumen = useApi<DatosResumen>("/api/admin/resumen");
  const r = resumen.data;

  const TABS: Pestana<Tab>[] = [
    { id: "resumen", label: "Resumen", icon: LayoutDashboard },
    { id: "inicio", label: "Portada", icon: LayoutTemplate },
    { id: "categorias", label: "Categorías", icon: Tags },
    { id: "referidos", label: "Referidos", icon: Gift },
    { id: "aliados", label: "Puntos Aliados", icon: Store, contador: r?.socios.pendientes },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "verificaciones", label: "Verificaciones", icon: ScanFace, contador: r?.usuarios.verificacion_pendiente },
    { id: "noticias", label: "Noticias", icon: Newspaper },
    { id: "programacion", label: "Programación", icon: Clock },
    { id: "avisos", label: "Avisos", icon: Megaphone },
    { id: "preguntas", label: "Preguntas", icon: CircleHelp },
    { id: "suscriptores", label: "Suscriptores", icon: Mail },
    { id: "pedidos", label: "Pedidos", icon: Receipt },
  ];

  return (
    <main className="flex-1 bg-gray-50">
      <PanelEncabezado titulo="Administración" subtitulo={`Sesión de ${user?.nombre} · aquí se administra todo el contenido del sitio`} />
      <Pestanas
        items={TABS}
        activa={tab}
        onChange={(t) => {
          irA(t);
          resumen.recargar(); // los contadores se mantienen al día al cambiar de pestaña
        }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === "resumen" && <Resumen estado={resumen} irA={irA} />}
        {tab === "aliados" && <AdminAliados key={filtro.vez} filtroInicial={filtro.valor} />}
        {tab === "usuarios" && <AdminUsuarios key={filtro.vez} filtroInicial={filtro.valor} />}
        {tab === "noticias" && <AdminNoticias key={filtro.vez} filtroInicial={filtro.valor} />}
        {tab === "inicio" && <AdminInicio />}
        {tab === "categorias" && <AdminCategorias />}
        {tab === "referidos" && <AdminReferidos />}
        {tab === "verificaciones" && <AdminVerificaciones alCambiar={resumen.recargar} />}
        {tab === "programacion" && <AdminProgramacion />}
        {tab === "avisos" && <AdminAvisos />}
        {tab === "preguntas" && <AdminPreguntas />}
        {tab === "suscriptores" && <AdminSuscriptores />}
        {tab === "pedidos" && <AdminPedidos key={filtro.vez} filtroInicial={filtro.valor} />}
      </div>
    </main>
  );
}
