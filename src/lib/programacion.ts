// src/lib/programacion.ts — parrilla del canal (viene de /api/programacion, se edita en Admin > Programación)
export type Programa = {
  id: number;
  titulo: string;
  descripcion: string | null;
  hora_inicio: string; // "18:00"
  hora_fin: string | null;
  dias: string; // "1234567" (1 = lunes)
  activo: boolean;
};

const NOMBRES = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function textoDias(dias: string) {
  if (dias === "1234567") return "Todos los días";
  if (dias === "12345") return "Lunes a viernes";
  if (dias === "123456") return "Lunes a sábado";
  if (dias === "67") return "Fines de semana";
  return dias.split("").map((d) => NOMBRES[Number(d)]).join(", ");
}

/** "18:00" -> "6:00 p. m." */
export function hora12(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  const sufijo = hh >= 12 ? "p. m." : "a. m.";
  return `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, "0")} ${sufijo}`;
}

/** Día (1-7) y minutos actuales en Colombia, sin depender de la zona horaria del servidor o del navegador */
export function ahoraColombia(fecha = new Date()) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(fecha);
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const dia = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(v("weekday")) + 1;
  return { dia, minutos: (Number(v("hour")) % 24) * 60 + Number(v("minute")) };
}

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};

/** Programa al aire ahora (si hay) */
export function programaActual(programas: Programa[], ahora = ahoraColombia()) {
  return (
    programas.find((p) => {
      if (!p.dias.includes(String(ahora.dia))) return false;
      const ini = aMin(p.hora_inicio);
      const fin = p.hora_fin ? aMin(p.hora_fin) : ini + 60;
      return ahora.minutos >= ini && ahora.minutos < fin;
    }) ?? null
  );
}
