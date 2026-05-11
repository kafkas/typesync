import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it } from 'vitest';

import * as v3 from '../generated/v3/catalog.js';
import * as v4 from '../generated/v4/catalog.js';
import { loadSample } from './_helpers.js';

// Pure-Zod parsing tests for the complex `catalog` fixture. These do NOT
// touch the Firestore emulator — they exercise the generated schemas
// directly against hand-crafted wire-shape inputs. The fixture covers:
//
//   - string + int enums (`Currency`, `Rating`)
//   - alias references (`ProductId`, `Money`, `Tag`, `InventoryEntry`)
//   - simple union (`Attribute`)
//   - discriminated union (`ProductDetails` over `kind`)
//   - lists of primitives, lists of aliases, lists of objects
//   - records (maps)
//   - optional fields (`rating`, `is_featured`)
//   - top-level `additionalFields: true` (`RawEvent`)
//
// `firebase-admin/firestore`'s `Timestamp` constructor is pure JS — we can
// build instances without booting the SDK or talking to the emulator, which
// keeps these tests self-contained.

type Variant = 'v3' | 'v4';

const VARIANTS: Array<{ name: Variant; mod: typeof v3 | typeof v4 }> = [
  { name: 'v3', mod: v3 },
  { name: 'v4', mod: v4 },
];

const ts = new Timestamp(1_700_000_000, 0);

interface CatalogSample {
  id: string;
  name: string;
  price: { amount_minor: number; currency: string };
  rating?: number;
  tags: string[];
  attributes: Record<string, string | number | boolean>;
  details: Record<string, unknown>;
  created_at: string;
}

function withTimestamp(sample: CatalogSample): unknown {
  return { ...sample, created_at: ts };
}

describe.each(VARIANTS)('catalog ($name)', ({ mod }) => {
  describe('Currency (string enum)', () => {
    it('accepts every member', () => {
      for (const c of ['USD', 'EUR', 'GBP'] as const) {
        expect(mod.CurrencySchema.safeParse(c).success).toBe(true);
      }
    });
    it('rejects unknown codes and non-strings', () => {
      expect(mod.CurrencySchema.safeParse('JPY').success).toBe(false);
      expect(mod.CurrencySchema.safeParse('').success).toBe(false);
      expect(mod.CurrencySchema.safeParse(1).success).toBe(false);
      expect(mod.CurrencySchema.safeParse(null).success).toBe(false);
    });
  });

  describe('Rating (int enum)', () => {
    it('accepts every numeric member', () => {
      for (const r of [1, 2, 3, 4, 5]) {
        expect(mod.RatingSchema.safeParse(r).success).toBe(true);
      }
    });
    it('rejects out-of-range and non-integer values', () => {
      expect(mod.RatingSchema.safeParse(0).success).toBe(false);
      expect(mod.RatingSchema.safeParse(6).success).toBe(false);
      expect(mod.RatingSchema.safeParse(3.5).success).toBe(false);
      expect(mod.RatingSchema.safeParse('5').success).toBe(false);
    });
  });

  describe('Attribute (simple union)', () => {
    it('accepts every member type', () => {
      expect(mod.AttributeSchema.safeParse('graphite').success).toBe(true);
      expect(mod.AttributeSchema.safeParse(42).success).toBe(true);
      expect(mod.AttributeSchema.safeParse(true).success).toBe(true);
    });
    it('rejects values outside the union', () => {
      expect(mod.AttributeSchema.safeParse(null).success).toBe(false);
      expect(mod.AttributeSchema.safeParse({ x: 1 }).success).toBe(false);
      expect(mod.AttributeSchema.safeParse([1, 2]).success).toBe(false);
      // Doubles must be rejected: `Attribute` covers `string | int | boolean`,
      // and our `int` codegen tightens to `z.number().int()`.
      expect(mod.AttributeSchema.safeParse(3.14).success).toBe(false);
    });
  });

  describe('Money (alias-referenced object)', () => {
    it('accepts a well-formed money value', () => {
      expect(mod.MoneySchema.safeParse({ amount_minor: 4999, currency: 'USD' }).success).toBe(true);
    });
    it('rejects the wrong currency', () => {
      expect(mod.MoneySchema.safeParse({ amount_minor: 1, currency: 'JPY' }).success).toBe(false);
    });
    it('rejects missing required fields', () => {
      expect(mod.MoneySchema.safeParse({ currency: 'USD' }).success).toBe(false);
      expect(mod.MoneySchema.safeParse({ amount_minor: 1 }).success).toBe(false);
    });
    it('rejects extra fields under strict object semantics', () => {
      expect(mod.MoneySchema.safeParse({ amount_minor: 1, currency: 'USD', extra: 'x' }).success).toBe(false);
    });
  });

  describe('ProductDetails (discriminated union)', () => {
    it('routes to the physical variant on kind=physical', () => {
      const ok = mod.ProductDetailsSchema.safeParse({
        kind: 'physical',
        weight_grams: 1500,
        inventory: [{ sku: 'A', quantity: 1 }],
      });
      expect(ok.success).toBe(true);
    });
    it('routes to the digital variant on kind=digital', () => {
      const ok = mod.ProductDetailsSchema.safeParse({
        kind: 'digital',
        download_url: 'https://example.com/x',
        file_size_bytes: 1024,
      });
      expect(ok.success).toBe(true);
    });
    it('rejects an unknown discriminator', () => {
      const bad = mod.ProductDetailsSchema.safeParse({
        kind: 'subscription',
        plan: 'pro',
      });
      expect(bad.success).toBe(false);
    });
    it('rejects fields belonging to the *other* variant', () => {
      const bad = mod.ProductDetailsSchema.safeParse({
        kind: 'physical',
        weight_grams: 1,
        inventory: [],
        // download_url is digital-only — strict object semantics reject it
        download_url: 'https://example.com',
      });
      expect(bad.success).toBe(false);
    });
    it('treats `is_featured` as optional and only accepts its single literal value when present', () => {
      const okPresent = mod.ProductDetailsSchema.safeParse({
        kind: 'physical',
        weight_grams: 1,
        inventory: [],
        is_featured: true,
      });
      const okAbsent = mod.ProductDetailsSchema.safeParse({
        kind: 'physical',
        weight_grams: 1,
        inventory: [],
      });
      const badValue = mod.ProductDetailsSchema.safeParse({
        kind: 'physical',
        weight_grams: 1,
        inventory: [],
        is_featured: false,
      });
      expect(okPresent.success).toBe(true);
      expect(okAbsent.success).toBe(true);
      expect(badValue.success).toBe(false);
    });
  });

  describe('Product (top-level document)', () => {
    it('accepts the physical hand-written sample', () => {
      const sample = loadSample('catalog', 'widget-physical') as CatalogSample;
      const result = mod.ProductSchema.safeParse(withTimestamp(sample));
      expect(result.success).toBe(true);
    });
    it('accepts the digital hand-written sample', () => {
      const sample = loadSample('catalog', 'ebook-digital') as CatalogSample;
      const result = mod.ProductSchema.safeParse(withTimestamp(sample));
      expect(result.success).toBe(true);
    });
    it('rejects a sample with the wrong details.kind', () => {
      const sample = loadSample('catalog', 'widget-physical') as CatalogSample;
      const broken = withTimestamp({
        ...sample,
        details: { ...sample.details, kind: 'subscription' },
      });
      expect(mod.ProductSchema.safeParse(broken).success).toBe(false);
    });
    it('rejects a sample whose tags array contains a non-string', () => {
      const sample = loadSample('catalog', 'widget-physical') as CatalogSample;
      const broken = withTimestamp({
        ...sample,
        tags: [...sample.tags, 42 as unknown as string],
      });
      expect(mod.ProductSchema.safeParse(broken).success).toBe(false);
    });
    it('rejects a sample whose attributes record contains a disallowed value type', () => {
      const sample = loadSample('catalog', 'widget-physical') as CatalogSample;
      const broken = withTimestamp({
        ...sample,
        attributes: { ...sample.attributes, malformed: { nested: 'object' } as unknown as string },
      });
      expect(mod.ProductSchema.safeParse(broken).success).toBe(false);
    });
    it('rejects a sample whose Timestamp slot is a plain object rather than a Timestamp instance', () => {
      const sample = loadSample('catalog', 'widget-physical') as CatalogSample;
      const broken = { ...sample, created_at: { seconds: 0, nanoseconds: 0 } };
      expect(mod.ProductSchema.safeParse(broken).success).toBe(false);
    });
  });

  describe('RawEvent (loose / passthrough object)', () => {
    it('accepts a document with extra unknown keys when the declared keys are valid', () => {
      const result = mod.RawEventSchema.safeParse({
        type: 'click',
        occurred_at: ts,
        page: '/home',
        button: 'cta',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as Record<string, unknown>).page).toBe('/home');
        expect((result.data as Record<string, unknown>).button).toBe('cta');
      }
    });
    it('still rejects a document missing a required declared key', () => {
      expect(mod.RawEventSchema.safeParse({ occurred_at: ts, foo: 'bar' }).success).toBe(false);
    });
    it('still rejects a document with the wrong type for a declared key', () => {
      expect(mod.RawEventSchema.safeParse({ type: 42, occurred_at: ts }).success).toBe(false);
    });
  });
});
