import { z } from 'zod';

import { getDuplicateElements } from '../../util/list.js';

const stringEnumType = z
  .object({
    type: z.literal('string-enum'),
    members: z.array(
      z
        .object({
          label: z.string(),
          value: z.string(),
        })
        .strict()
    ),
  })
  .strict()
  .superRefine((candidate, ctx) => {
    if (candidate.members.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'An enum type must have at least one member.',
        fatal: true,
      });
      return z.NEVER;
    }
    const labels = candidate.members.map(member => member.label);
    const values = candidate.members.map(member => member.value);
    const [duplicateLabel] = getDuplicateElements(labels);
    const [duplicateValue] = getDuplicateElements(values);
    if (duplicateLabel !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The enum member label "${duplicateLabel}" has been used more than once. Each enum member must have a distinct label.`,
        fatal: true,
      });
      return z.NEVER;
    }
    if (duplicateValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The enum member value ${typeof duplicateValue === 'string' ? `"${duplicateValue}"` : duplicateValue} has been used more than once. Each enum member must have a distinct value.`,
        fatal: true,
      });
    }
  });

export const type = stringEnumType;
