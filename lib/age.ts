/** Formata a idade (anos e meses) a partir de uma data de nascimento. */
export function childAge(birthDate: string | null): string {
  if (!birthDate) return "Idade não informada";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "Idade não informada";

  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}m`;
  if (rest === 0) return `${years}a`;
  return `${years}a ${rest}m`;
}
