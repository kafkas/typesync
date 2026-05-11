import * as firestore from 'firebase-admin/firestore';
import { z } from 'zod-v3';

export const AttributeSchema = z.union([z.string(), z.number().int(), z.boolean()]);
export type Attribute = z.infer<typeof AttributeSchema>;

/** ISO-4217 currency code. */
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP']).describe('ISO-4217 currency code.');
export type Currency = z.infer<typeof CurrencySchema>;

export const InventoryEntrySchema = z.object({ sku: z.string(), quantity: z.number().int() }).strict();
export type InventoryEntry = z.infer<typeof InventoryEntrySchema>;

/** A monetary amount expressed in a given currency. */
export const MoneySchema = z
  .object({
    amount_minor: z.number().int().describe("Amount in the currency's minor unit (e.g. cents for USD)."),
    currency: z.lazy(() => CurrencySchema),
  })
  .strict()
  .describe('A monetary amount expressed in a given currency.');
export type Money = z.infer<typeof MoneySchema>;

export const ProductDetailsSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('physical'),
      weight_grams: z.number().int(),
      inventory: z.array(z.lazy(() => InventoryEntrySchema)),
      is_featured: z.literal(true).optional(),
    })
    .strict(),
  z.object({ kind: z.literal('digital'), download_url: z.string(), file_size_bytes: z.number().int() }).strict(),
]);
export type ProductDetails = z.infer<typeof ProductDetailsSchema>;

/** Stable identifier for a catalog product. */
export const ProductIdSchema = z.string().describe('Stable identifier for a catalog product.');
export type ProductId = z.infer<typeof ProductIdSchema>;

/** Customer rating expressed as an integer 1..5. */
export const RatingSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
  .describe('Customer rating expressed as an integer 1..5.');
export type Rating = z.infer<typeof RatingSchema>;

export const TagSchema = z.string();
export type Tag = z.infer<typeof TagSchema>;

/** A product in the store catalog. */
export const ProductSchema = z
  .object({
    id: z.lazy(() => ProductIdSchema),
    name: z.string(),
    price: z.lazy(() => MoneySchema),
    rating: z.lazy(() => RatingSchema).optional(),
    tags: z.array(z.lazy(() => TagSchema)),
    attributes: z.record(z.lazy(() => AttributeSchema)),
    details: z.lazy(() => ProductDetailsSchema),
    created_at: z.instanceof(firestore.Timestamp),
  })
  .strict()
  .describe('A product in the store catalog.');
export type Product = z.infer<typeof ProductSchema>;

export const RawEventSchema = z
  .object({ type: z.string(), occurred_at: z.instanceof(firestore.Timestamp) })
  .passthrough();
export type RawEvent = z.infer<typeof RawEventSchema>;
