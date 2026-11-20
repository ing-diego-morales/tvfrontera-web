// src/components/auth/RegistroForm.tsx — registro como Cliente o como Punto Aliado
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Store, User, UserPlus } from "lucide-react";
import { useAuth, type RegistroDatos } from "@/components/AuthProvider";
import { AreaTexto, Aviso, Boton, Campo } from "@/components/ui";
import { mensajeError } from "@/lib/api";
import SelectorCategoria from "@/components/SelectorCategoria";
import { rutaSegura } from "@/lib/format";
import { inicioPorRol } from "@/lib/rutas";
import { useAntiBot } from "@/components/AntiBot";
import { api } from "@/lib/api";
import { Gift } from "lucide-react";
import CamposContacto, { CONTACTO_VACIO, contactoParaApi } from "@/components/aliados/CamposContacto";

type Tipo = "CLIENTE" | "SOCIO";

const vacio = {
  nombre: "",
  email: "",
  password: "",
  confirmar: "",
  telefono: "",
  cedula: "",
  negocio: "",
  ciudad: "Cúcuta",
  categoria: "",
  descripcion: "",
};

export default function RegistroForm({ tipoInicial = "CLIENTE", next, refCodigo }: { tipoInicial?: Tipo; next?: string; refCodigo?: string }) {
  const { user, cargando, registro } = useAuth();
  const antiBot = useAntiBot();
  // Programa de referidos: "Juan P. te invitó"
  const [invitadoPor, setInvitadoPor] = useState<string | null>(null);
  useEffect(() => {
    if (!refCodigo) return;
    let vivo = true;
    api<{ nombre: string }>(`/api/referidos/codigo/${encodeURIComponent(refCodigo)}`)
      .then((d) => vivo && setInvitadoPor(d.nombre))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [refCodigo]);
  const conInvitacion = Boolean(invitadoPor);
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [f, setF] = useState(vacio);
  const [contacto, setContacto] = useState(CONTACTO_VACIO);
  const [acepta, setAcepta] = useState(false);
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cargando && user) router.replace(rutaSegura(next, inicioPorRol(user.rol)));
  }, [cargando, user, next, router]);

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [e.target.name]: e.target.value });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Validaciones rápidas en el navegador (la API vuelve a validar todo)
    if (f.password.length < 8) return setError("La contraseña debe tener mínimo 8 caracteres.");
    if (f.password !== f.confirmar) return setError("Las contraseñas no coinciden.");
    if (f.cedula && !/^\d{5,15}$/.test(f.cedula)) return setError("La cédula debe tener solo números (5 a 15 dígitos).");
    if (!acepta) return setError("Debes aceptar la política de privacidad y los términos.");

    const datos: RegistroDatos = {
      nombre: f.nombre.trim(),
      email: f.email.trim(),
      password: f.password,
      telefono: f.telefono.trim() || undefined,
      cedula: f.cedula.trim() || undefined,
      rol: tipo,
      ref: conInvitacion ? refCodigo : undefined,
      ...antiBot.datos(),
      negocio:
        tipo === "SOCIO"
          ? {
              nombre: f.negocio.trim(),
              ciudad: f.ciudad.trim(),
              categoria: f.categoria || undefined,
              descripcion: f.descripcion.trim() || undefined,
              ...contactoParaApi(contacto),
            }
          : undefined,
    };

    setEnviando(true);
    try {
      const { user: u } = await registro(datos);
      if (u) router.replace(rutaSegura(next, inicioPorRol(u.rol)));
    } catch (err) {
      setError(mensajeError(err));
      antiBot.reiniciar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setEnviando(false);
    }
  };

  const opcion = (valor: Tipo, Icon: typeof User, titulo: string, texto: string) => (
    <button
      type="button"
      onClick={() => setTipo(valor)}
      aria-pressed={tipo === valor}
      className={`text-left p-4 rounded-xl border-2 transition-colors ${
        tipo === valor ? "border-naranja bg-naranja/5" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <Icon className={tipo === valor ? "text-naranja" : "text-indigo"} size={22} />
      <p className="font-bold text-indigo mt-2">{titulo}</p>
      <p className="text-xs text-gray-500 mt-1">{texto}</p>
    </button>
  );

  return (
    <form suppressHydrationWarning onSubmit={enviar} className="space-y-6 relative">
      {antiBot.campos}
      <div className="grid grid-cols-2 gap-3">
        {opcion("CLIENTE", User, "Cliente", "Compra a los Puntos Aliados y ve sus datos de contacto.")}
        {opcion("SOCIO", Store, "Punto Aliado", "Publica tu negocio y tus productos en Televentas Fest.")}
      </div>

      {invitadoPor && (
        <div className="flex items-center gap-3 rounded-xl bg-naranja-claro ring-1 ring-naranja/30 px-4 py-3">
          <Gift className="text-naranja shrink-0" size={22} />
          <p className="text-sm text-indigo">
            <b>{invitadoPor}</b> te invitó a Televentas Fest. Registra tu cédula y confirma tu correo para que su invitación cuente.
          </p>
        </div>
      )}
      {error && <Aviso>{error}</Aviso>}

      <fieldset className="space-y-4">
        <legend className="font-bold text-indigo mb-2">Tus datos</legend>
        <Campo label="Nombre completo" name="nombre" required autoComplete="name" value={f.nombre} onChange={cambiar} maxLength={100} />
        <Campo label="Correo electrónico" name="email" type="email" required autoComplete="email" value={f.email} onChange={cambiar} maxLength={150} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Teléfono" name="telefono" type="tel" autoComplete="tel" value={f.telefono} onChange={cambiar} maxLength={30} />
          <Campo
            label="Cédula"
            name="cedula"
            inputMode="numeric"
            required={tipo === "SOCIO" || conInvitacion}
            value={f.cedula}
            onChange={cambiar}
            maxLength={15}
            ayuda={tipo === "SOCIO" ? "Necesaria para verificar tu identidad" : conInvitacion ? "Necesaria para que cuente la invitación (una cédula = una cuenta)" : "Opcional"}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Campo
              label="Contraseña"
              name="password"
              type={ver ? "text" : "password"}
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={f.password}
              onChange={cambiar}
              ayuda="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setVer(!ver)}
              aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-8.5 text-gray-400 hover:text-indigo"
            >
              {ver ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Campo
            label="Confirmar contraseña"
            name="confirmar"
            type={ver ? "text" : "password"}
            required
            autoComplete="new-password"
            maxLength={72}
            value={f.confirmar}
            onChange={cambiar}
          />
        </div>
      </fieldset>

      {tipo === "SOCIO" && (
        <fieldset className="space-y-4 border-t border-gray-100 pt-6">
          <legend className="font-bold text-indigo mb-2">Tu negocio</legend>
          <Campo label="Nombre del negocio" name="negocio" required value={f.negocio} onChange={cambiar} maxLength={150} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Ciudad" name="ciudad" required value={f.ciudad} onChange={cambiar} maxLength={100} />
            <SelectorCategoria valor={f.categoria} onChange={cambiar} />
          </div>
          <AreaTexto label="Describe tu negocio" name="descripcion" rows={3} value={f.descripcion} onChange={cambiar} maxLength={2000} />
          <p className="font-bold text-indigo pt-2">Contacto para tus clientes</p>
          <CamposContacto valores={contacto} onChange={(e) => setContacto({ ...contacto, [e.target.name]: e.target.value })} />
          <Aviso tipo="info">
            Tu tienda se publica cuando Televentas Fest apruebe tu solicitud y se registre el pago de la primera mensualidad.
          </Aviso>
        </fieldset>
      )}

      <label className="flex items-start gap-3 text-sm text-gray-600">
        <input suppressHydrationWarning type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 accent-naranja" required />
        <span>
          Acepto la{" "}
          <Link href="/privacidad" target="_blank" className="font-bold text-indigo underline">
            política de privacidad
          </Link>{" "}
          y los{" "}
          <Link href="/terminos" target="_blank" className="font-bold text-indigo underline">
            términos y condiciones
          </Link>
          , y autorizo el tratamiento de mis datos personales.
        </span>
      </label>

      <Boton type="submit" cargando={enviando} className="w-full py-3">
        <UserPlus size={18} /> {tipo === "SOCIO" ? "Enviar solicitud de Punto Aliado" : "Crear mi cuenta"}
      </Boton>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-naranja hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
