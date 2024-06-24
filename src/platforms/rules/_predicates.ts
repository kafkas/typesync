import type { RulesDataType } from './_types.js';

export interface BooleanPredicate {
  type: 'boolean';
  value: boolean;
}

export interface ReferencePredicate {
  type: 'reference';
  varName: string;
}

export interface ValueEqualityPredicate {
  type: 'value-equality';
  varName: string;
  varValue: string;
}

export interface TypeEqualityPredicate {
  type: 'type-equality';
  varName: string;
  varType: RulesDataType;
}

export interface TypeValidatorPredicate {
  type: 'type-validator';
  validatorName: string;
  varName: string;
}

export interface ReadonlyFieldValidatorPredicate {
  type: 'readonly-field-validator';
  validatorName: string;
  prevDataParam: string;
  nextDataParam: string;
}

export interface MapDiffHasAffectedKeysPredicate {
  type: 'map-diff-has-affected-keys';
  prevDataParam: string;
  nextDataParam: string;
  keys: string[];
}

export interface MapHasKeyPredicate {
  type: 'map-has-key';
  varName: string;
  key: string;
}

export interface MapHasOnlyKeysPredicate {
  type: 'map-has-only-keys';
  varName: string;
  keys: string[];
}

export interface LiteralPredicate {
  type: 'literal';
  value: string;
}

export interface OrPredicate {
  type: 'or';
  alignment: 'vertical' | 'horizontal';
  innerPredicates: Predicate[];
}

export interface AndPredicate {
  type: 'and';
  alignment: 'vertical' | 'horizontal';
  innerPredicates: Predicate[];
}

export interface NegationPredicate {
  type: 'negation';
  originalPredicate: Predicate;
}

export type Predicate =
  | BooleanPredicate
  | ReferencePredicate
  | ValueEqualityPredicate
  | TypeEqualityPredicate
  | TypeValidatorPredicate
  | ReadonlyFieldValidatorPredicate
  | MapDiffHasAffectedKeysPredicate
  | MapHasKeyPredicate
  | MapHasOnlyKeysPredicate
  | LiteralPredicate
  | OrPredicate
  | AndPredicate
  | NegationPredicate;
