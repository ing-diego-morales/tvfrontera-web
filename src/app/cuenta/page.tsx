// src/app/cuenta/page.tsx — panel del usuario (cualquier rol)
"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, KeyRound, ShieldCheck, ShoppingBag, Store, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PanelEncabezado, Pestanas, type Pestana } from "@/components/panel/PanelUI";
import PerfilForm from "@/components/cuenta/PerfilForm";
import PasswordForm from "@/components/cuenta/PasswordForm";
import Verificacion from "@/components/cuenta/Verificacion";
import MisPedidos from "@/components/cuenta/MisPedidos";
import SolicitudAliado from "@/components/cuenta/SolicitudAliado";
import AvisoConfirmarCorreo from "@/components/cuenta/AvisoConfirmarCorreo";
import PanelReferidos from "@/components/referidos/PanelReferidos";

type Tab = "pedidos" | "referidos" | "perfil" | "seguridad";

const TABS: Pestana<Tab>[] = [
  { id: "pedidos", label: "Mis pedidos", icon: ShoppingBag },
  { id: "referidos", label: "Refiere y gana", icon: Gift },
  { id: "perfil", label: "Mis datos", icon: User },
  { id: "seguridad", label: "Seguridad", icon: KeyRound },
];

export default function CuentaPage() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "ADMIN";
  // El admin administra: no compra ni participa en referidos, solo ve sus datos y su seguridad
  const [tab, setTab] = useState<Tab>(esAdmin ? "perfil" : "pedidos");
  if (!user) return null;
  const tabs = esAdmin ? TABS.filter((t) => t.id === "perfil" || t.id === "seguridad") : TABS;

  return (
    <main className="flex-1 bg-gray-50">
      <PanelEncabezado titulo={`Hola, ${user.nombre.split(" ")[0]}`} subtitulo={user.email}>
        {user.rol === "SOCIO" && (
          <Link href="/panel" className="flex items-center gap-2 bg-amarillo text-indigo font-bold px-5 py-2 rounded-full hover:bg-amarillo-oscuro transition-colors">
            <Store size={18} /> Ir a mi Punto Aliado
          </Link>
        )}
        {user.rol === "ADMIN" && (
          <Link href="/admin" className="flex items-center gap-2 bg-amarillo text-indigo font-bold px-5 py-2 rounded-full hover:bg-amarillo-oscuro transition-colors">
            <ShieldCheck size={18} /> Ir a Administración
          </Link>
        )}
      </PanelEncabezado>
      <Pestanas items={tabs} activa={tab} onChange={setTab} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <AvisoConfirmarCorreo />
        {tab === "referidos" && <PanelReferidos />}
        {tab === "pedidos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MisPedidos />
            </div>
            <div className="space-y-6">{user.rol === "CLIENTE" && <SolicitudAliado />}</div>
          </div>
        )}
        {tab === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerfilForm />
            <Verificacion />
          </div>
        )}
        {tab === "seguridad" && (
          <div className="max-w-xl">
            <PasswordForm />
          </div>
        )}
      </div>
    </main>
  );
}
