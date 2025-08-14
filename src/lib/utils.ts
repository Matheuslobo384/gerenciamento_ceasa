import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata valores monetários em pt-BR (R$ 1.234,56)
export function formatarMoeda(valor: number | null | undefined): string {
  const numeric = typeof valor === 'number' ? valor : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

// Formata números com quantidade de casas decimais controlada
export function formatarNumero(
  valor: number | null | undefined,
  casasDecimais?: number
): string {
  const numeric = typeof valor === 'number' ? valor : 0;
  const isInteiro = Number.isInteger(numeric) && casasDecimais === undefined;
  const casas = isInteiro ? 0 : (casasDecimais ?? 2);
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(numeric);
}