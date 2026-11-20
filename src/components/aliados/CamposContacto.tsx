// src/components/aliados/CamposContacto.tsx — datos de contacto del aliado (registro, solicitud y panel)
// WhatsApp y dirección son OBLIGATORIOS: son el acceso rápido que ven los clientes.
import { Campo } from "@/components/ui";

export type DatosContacto = { whatsapp: string; direccion: string; telefono: string; horario: string; instagram: string; facebook: string };

export const CONTACTO_VACIO: DatosContacto = { whatsapp: "", direccion: "", telefono: "", horario: "", instagram: "", facebook: "" };

/** Convierte "" a null/undefined para la API */
export const contactoParaApi = (c: DatosContacto) => ({
  whatsapp: c.whatsapp.trim(),
  direccion: c.direccion.trim(),
  telefono: c.telefono.trim() || null,
  horario: c.horario.trim() || null,
  instagram: c.instagram.trim() || null,
  facebook: c.facebook.trim() || null,
});

export default function CamposContacto({
  valores,
  onChange,
}: {
  valores: DatosContacto;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="negocio-whatsapp" label="WhatsApp del negocio" name="whatsapp" type="tel" required minLength={7} maxLength={20} value={valores.whatsapp} onChange={onChange} placeholder="300 123 4567" ayuda="Los clientes te escribirán aquí" />
        <Campo id="negocio-telefono" label="Teléfono fijo" name="telefono" type="tel" maxLength={20} value={valores.telefono} onChange={onChange} placeholder="Opcional" />
      </div>
      <Campo id="negocio-direccion" label="Dirección del negocio" name="direccion" required minLength={5} maxLength={200} value={valores.direccion} onChange={onChange} placeholder="Calle 10 # 5-20, Barrio Centro" ayuda="Se usa para el botón “Cómo llegar” (Google Maps)" />
      <Campo id="negocio-horario" label="Horario de atención" name="horario" maxLength={150} value={valores.horario} onChange={onChange} placeholder="Lun a Sáb 8:00 a.m. - 7:00 p.m." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="negocio-instagram" label="Instagram" name="instagram" maxLength={100} value={valores.instagram} onChange={onChange} placeholder="@tunegocio" />
        <Campo id="negocio-facebook" label="Facebook" name="facebook" type="url" maxLength={200} value={valores.facebook} onChange={onChange} placeholder="https://facebook.com/tunegocio" />
      </div>
    </div>
  );
}
