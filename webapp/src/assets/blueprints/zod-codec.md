---
id: zod-codec
name: Zod Codec
description: "z.codec(outerSchema, innerSchema, { decode, encode }) pattern for types that need different wire vs runtime representations"
usage: Use when defining a Zod schema that needs to transform between wire format (e.g. string) and runtime type (e.g. Decimal) with bidirectional encode/decode
project: shared
layer: schema
source: target/schemas/src/decimal.schema.ts:L9
---

# Zod Codec

## When to use

Use when defining a Zod schema that needs to transform between wire format (e.g. string) and runtime type (e.g. Decimal) with bidirectional encode/decode

## Reference implementation

```typescript
import DecimalClass from 'decimal.js';
import { z } from 'zod';
import { type Decimal, isDecimalLike } from './decimal.core';

/**
 * @Blueprint zod-codec
 * @BlueprintName Zod Codec
 * @BlueprintUsage Use when defining a Zod schema that needs to transform between wire format (e.g. string) and runtime type (e.g. Decimal) with bidirectional encode/decode
 * @BlueprintDescription z.codec(outerSchema, innerSchema, { decode, encode }) pattern for types that need different wire vs runtime representations
 */
function createDecimalCodec(decimalPlaces: number): DecimalCodec {
  return z.codec(z.string(), z.custom<Decimal>(isDecimalLike), {
    decode: (value: string, ctx) => {
      try {
        return new DecimalClass(value);
      } catch {
        ctx.issues.push({
          code: 'custom',
          input: value,
          message: 'Invalid decimal value',
        });
        return z.NEVER;
      }
    },
    encode: (value: Decimal) => value.toFixed(decimalPlaces),
  });
}
```
