/**
 * Modelo de Categoría IA Memory · temas y motivos de contacto que la
 * IA etiqueta sobre las conversaciones (ej. "queja de facturación",
 * "consulta técnica", "venta cruzada").
 *
 * Migrado desde `CategoriesContext.tsx` del prototipo React.
 *
 * `linkedRules`: relación con reglas que referencian esta categoría
 * (read-only, se computa al cargar las reglas). En iter 11a no
 * implementamos la sincronización bidireccional — se diferirá a 11b.
 */
export interface LinkedRuleRef {
  readonly id: number;
  readonly name: string;
  readonly isActive: boolean;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly group?: string;
  readonly isActive: boolean;
  readonly usedInRules: number;
  readonly classifiedCalls: number;
  readonly createdAt: string;
  readonly isTemplate?: boolean;
  readonly linkedRules?: readonly LinkedRuleRef[];
}
