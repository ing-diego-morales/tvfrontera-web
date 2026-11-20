// src/app/terminos/page.tsx
// ⚠️ PLANTILLA: debe revisarla un abogado antes de producción (incluye referencias a la Ley 1480 de 2011).
import type { Metadata } from "next";
import DocumentoLegal, { type SeccionLegal } from "@/components/legal/DocumentoLegal";
import { SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso del sitio de TV Frontera, de las cuentas de usuario y de la red de Puntos Aliados.",
  alternates: { canonical: "/terminos" },
};

const secciones: SeccionLegal[] = [
  {
    id: "aceptacion",
    titulo: "Aceptación",
    contenido: <p>Al usar {SITIO.dominio} aceptas estos términos. Si no estás de acuerdo, por favor no uses el sitio.</p>,
  },
  {
    id: "contenido",
    titulo: "Contenido y propiedad intelectual",
    contenido: (
      <p>
        Las noticias, videos, imágenes, la marca y el logotipo de {SITIO.nombre} son propiedad del canal o de sus autores.
        Puedes compartir nuestros enlaces y citar el contenido mencionando la fuente; no está permitido reproducirlo con
        fines comerciales sin autorización escrita.
      </p>
    ),
  },
  {
    id: "cuentas",
    titulo: "Cuentas de usuario",
    contenido: (
      <ul>
        <li>Debes ser mayor de edad y dar información real y actualizada.</li>
        <li>Eres responsable de mantener tu contraseña en secreto. Si crees que alguien la conoce, cámbiala o usa &quot;¿Olvidaste tu contraseña?&quot;.</li>
        <li>Podemos suspender cuentas que hagan uso indebido, fraudulento o abusivo del sitio.</li>
      </ul>
    ),
  },
  {
    id: "aliados",
    titulo: "Puntos Aliados",
    contenido: (
      <ul>
        <li>La publicación requiere aprobación de {SITIO.nombre} y el pago de la mensualidad vigente.</li>
        <li>El Punto Aliado debe mantener actualizados sus datos de contacto obligatorios (WhatsApp y dirección).</li>
        <li>Cada Punto Aliado es responsable de sus productos, precios, existencias, entregas, garantías y facturación.</li>
        <li>Si la mensualidad vence, la tienda deja de mostrarse hasta que se renueve; la información no se borra.</li>
        <li>No se permite publicar productos ilegales, falsificados o que infrinjan derechos de terceros.</li>
      </ul>
    ),
  },
  {
    id: "posicionamiento",
    titulo: "Orden y espacios destacados",
    contenido: (
      <p>
        Por transparencia: el orden en que aparecen los Puntos Aliados y sus productos considera espacios{" "}
        <strong>destacados pagados</strong>, el <strong>plan</strong> contratado (Básico o Premium) y una{" "}
        <strong>rotación diaria</strong> que da visibilidad equitativa a todos los aliados del mismo nivel. Los elementos
        destacados se identifican con una etiqueta visible.
      </p>
    ),
  },
  {
    id: "pedidos",
    titulo: "Pedidos y compras",
    contenido: (
      <p>
        Los pedidos se acuerdan directamente entre el cliente y el Punto Aliado; {SITIO.nombre} facilita el contacto pero
        no es parte de la compraventa. Los derechos del consumidor (garantía, información, retracto cuando aplique) se
        rigen por la <strong>Ley 1480 de 2011</strong> y deben ser atendidos por el Punto Aliado. Un pedido pendiente
        puede cancelarse desde &quot;Mi cuenta&quot;.
      </p>
    ),
  },
  {
    id: "conducta",
    titulo: "Conducta en el sitio",
    contenido: (
      <ul>
        <li>No publiques contenido ofensivo, discriminatorio, falso o que vulnere derechos de terceros.</li>
        <li>No intentes acceder a cuentas ajenas, alterar el funcionamiento del sitio ni extraer datos de forma automatizada.</li>
      </ul>
    ),
  },
  {
    id: "responsabilidad",
    titulo: "Limitación de responsabilidad",
    contenido: (
      <p>
        Trabajamos para que el sitio esté disponible y la información sea precisa, pero puede haber interrupciones o
        errores. {SITIO.nombre} no responde por los acuerdos entre clientes y Puntos Aliados ni por el contenido de sitios
        externos enlazados.
      </p>
    ),
  },
  {
    id: "ley",
    titulo: "Ley aplicable",
    contenido: <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se tramitará ante las autoridades competentes de Cúcuta.</p>,
  },
  {
    id: "cambios",
    titulo: "Cambios",
    contenido: <p>Podemos actualizar estos términos. La versión vigente siempre estará publicada en esta página con su fecha de actualización.</p>,
  },
];

export default function TerminosPage() {
  return (
    <DocumentoLegal
      titulo="Términos y Condiciones"
      resumen="Las reglas para usar el sitio de TV Frontera, crear una cuenta y participar en la red de Puntos Aliados."
      actualizado="noviembre de 2026"
      version="1.1"
      secciones={secciones}
      relacionado={{ href: "/privacidad", label: "Política de Tratamiento de Datos" }}
    />
  );
}
