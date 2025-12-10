// src/utils.ts
export const TEMP_PASSWORD_TTL_DAYS =
  Number(process.env.TEMP_PASSWORD_TTL_DAYS || "3");

export function isUnifranzEmail(email: string) {
  return email.endsWith("@unifranz.edu.bo");
}

export function generarPasswordTemporal(len = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// map frontend value → DBS enum
export function materiaToEnum(m: string | null | undefined) {
  if (!m) return null;
  switch (m.trim()) {
    case "Derecho Procesal Civil":
      return "DERECHO_PROCESAL_CIVIL";
    case "Derecho Digital Penal":
      return "DERECHO_DIGITAL_PENAL";
    case "Derecho Corporativo Digital":
      return "DERECHO_CORPORATIVO_DIGITAL";
    case "Contratos":
      return "CONTRATOS";
    default:
      return null;
  }
}
