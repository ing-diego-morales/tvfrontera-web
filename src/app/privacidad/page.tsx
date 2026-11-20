// src/app/privacidad/page.tsx
// ⚠️ PLANTILLA basada en la Ley 1581 de 2012 y el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).
//    Debe revisarla un abogado y completarse con razón social, NIT y dirección reales antes de producción.
import type { Metadata } from "next";
import DocumentoLegal, { type SeccionLegal } from "@/components/legal/DocumentoLegal";
import { SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales",
  description: "Cómo TV Frontera recolecta, usa, protege y permite ejercer tus derechos sobre tus datos personales (Ley 1581 de 2012).",
  alternates: { canonical: "/privacidad" },
};

const secciones: SeccionLegal[] = [
  {
    id: "responsable",
    titulo: "Responsable del tratamiento",
    contenido: (
      <p>
        <strong>{SITIO.nombre}</strong>, canal de televisión y medio digital con domicilio en {SITIO.ciudad}. Correo:{" "}
        {SITIO.correo} · Teléfono y WhatsApp: {SITIO.telefono}. En esta política &quot;nosotros&quot; se refiere a TV Frontera y
        &quot;tú&quot; al titular de los datos.
      </p>
    ),
  },
  {
    id: "alcance",
    titulo: "Alcance y marco legal",
    contenido: (
      <p>
        Esta política aplica a los datos personales que tratamos a través de {SITIO.dominio} y sus servicios asociados, en
        cumplimiento de la <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong> y demás normas de
        protección de datos de Colombia.
      </p>
    ),
  },
  {
    id: "datos",
    titulo: "Datos que recolectamos",
    contenido: (
      <ul>
        <li><strong>Al registrarte:</strong> nombre, correo electrónico, teléfono y, de forma opcional, número de cédula.</li>
        <li><strong>Si eres Punto Aliado:</strong> nombre del negocio, ciudad, dirección, WhatsApp, teléfono, horario, redes sociales y los productos que publicas.</li>
        <li><strong>Al comprar:</strong> productos, cantidades, valores y notas de tus pedidos.</li>
        <li><strong>Verificación de identidad (opcional):</strong> foto de tu cédula por ambos lados y una foto de tu rostro (dato biométrico, considerado <strong>dato sensible</strong>). Solo se recolectan con tu autorización expresa, no estás obligado a entregarlos y se usan únicamente para confirmar que eres el titular de la cédula. Se guardan de forma privada, solo las ve el equipo de verificación y puedes pedir que se eliminen.</li>
        <li><strong>Navegación:</strong> un contador anónimo de visitas y datos técnicos mínimos (como la dirección IP) para seguridad y prevención de fraude.</li>
      </ul>
    ),
  },
  {
    id: "finalidades",
    titulo: "Finalidades del tratamiento",
    contenido: (
      <ul>
        <li>Crear, administrar y proteger tu cuenta, incluida la recuperación de contraseña por correo.</li>
        <li>Conectar a clientes con Puntos Aliados y gestionar pedidos.</li>
        <li>Verificar la identidad de los Puntos Aliados y prevenir fraudes.</li>
        <li>Gestionar la membresía y los pagos de los Puntos Aliados.</li>
        <li>Enviar avisos de seguridad sobre tu cuenta y, si lo autorizas, información del canal.</li>
        <li>Atender peticiones, quejas y reclamos.</li>
      </ul>
    ),
  },
  {
    id: "aliados",
    titulo: "Datos de contacto de los Puntos Aliados",
    contenido: (
      <p>
        El WhatsApp, el teléfono y la dirección de un Punto Aliado solo se muestran a usuarios con sesión iniciada. Así
        reducimos la recolección automática de números por parte de robots y terceros. El nombre del negocio, su
        categoría, ciudad, horario y redes sociales son públicos.
      </p>
    ),
  },
  {
    id: "cookies",
    titulo: "Cookies y almacenamiento local",
    contenido: (
      <ul>
        <li><strong>Cookie de sesión</strong> (tvf_session): necesaria para mantener tu sesión. Es segura (httpOnly) y no puede ser leída por scripts.</li>
        <li><strong>Preferencias</strong>: guardamos en tu navegador tu elección sobre cookies y algunas preferencias de visualización.</li>
        <li>No usamos cookies para vender tu información a anunciantes.</li>
      </ul>
    ),
  },
  {
    id: "seguridad",
    titulo: "Seguridad de la información",
    contenido: (
      <ul>
        <li>Las contraseñas se guardan cifradas con un algoritmo de un solo sentido; nadie, ni siquiera nosotros, puede verlas.</li>
        <li>Los enlaces de recuperación de contraseña vencen en 30 minutos, sirven una sola vez y se guardan cifrados.</li>
        <li>Al cambiar tu contraseña cerramos tu sesión en los demás equipos.</li>
        <li>El acceso a la información está limitado según el rol de cada usuario.</li>
      </ul>
    ),
  },
  {
    id: "encargados",
    titulo: "Transferencia y encargados",
    contenido: (
      <p>
        No vendemos ni cedemos tus datos. Podemos apoyarnos en proveedores (alojamiento web, envío de correos y verificación
        de identidad) que actúan como encargados del tratamiento, bajo acuerdos de confidencialidad y solo para las
        finalidades descritas.
      </p>
    ),
  },
  {
    id: "conservacion",
    titulo: "Conservación de los datos",
    contenido: (
      <p>
        Conservamos tus datos mientras tengas una cuenta activa y durante el tiempo que exijan las obligaciones legales,
        contables o de atención de reclamos. Después los eliminamos o anonimizamos.
      </p>
    ),
  },
  {
    id: "derechos",
    titulo: "Tus derechos",
    contenido: (
      <>
        <p>Como titular puedes, en cualquier momento y de forma gratuita:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos (también desde &quot;Mi cuenta&quot;).</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso que hemos dado a tus datos.</li>
          <li>Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal de conservarlos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
        </ul>
      </>
    ),
  },
  {
    id: "procedimiento",
    titulo: "Cómo ejercer tus derechos",
    contenido: (
      <p>
        Escríbenos a <strong>{SITIO.correo}</strong> indicando tu nombre, correo registrado y tu solicitud. Respondemos{" "}
        <strong>consultas en máximo 10 días hábiles</strong> y <strong>reclamos en máximo 15 días hábiles</strong>,
        prorrogables en los casos que permite la ley.
      </p>
    ),
  },
  {
    id: "menores",
    titulo: "Menores de edad",
    contenido: <p>Los servicios de cuenta y compra están dirigidos a mayores de 18 años. No recolectamos intencionalmente datos de menores.</p>,
  },
  {
    id: "cambios",
    titulo: "Cambios y vigencia",
    contenido: (
      <p>
        Esta política rige desde su publicación. Si hacemos cambios importantes, lo anunciaremos en el sitio. Al crear una
        cuenta aceptas esta política y autorizas el tratamiento de tus datos para las finalidades descritas.
      </p>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <DocumentoLegal
      titulo="Política de Tratamiento de Datos"
      resumen="Cómo recolectamos, usamos y protegemos tu información personal, y cómo puedes ejercer tus derechos."
      actualizado="noviembre de 2026"
      version="1.2"
      secciones={secciones}
      relacionado={{ href: "/terminos", label: "Términos y Condiciones" }}
    />
  );
}
