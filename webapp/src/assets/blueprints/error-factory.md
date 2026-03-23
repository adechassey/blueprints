---
id: error-factory
name: Domain Error Factory
description: Arrow-function factories returning NotFoundException/BadRequestException with ErrorCodes and ErrorMessages from shared schemas
usage: Use for typed NestJS exception factories with ErrorCodes and i18n messages
project: server
layer: error
source: target/server/src/area/area.error.ts:L5
---

# Domain Error Factory

## When to use

Use for typed NestJS exception factories with ErrorCodes and i18n messages

## Reference implementation

```typescript
import { ErrorCodes, ErrorMessages } from '@acme/schemas/errors';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * @Blueprint error-factory
 * @BlueprintName Domain Error Factory
 * @BlueprintUsage Use for typed NestJS exception factories with ErrorCodes and i18n messages
 * @BlueprintDescription Arrow-function factories returning NotFoundException/BadRequestException with ErrorCodes and ErrorMessages from shared schemas
 */
export const AreaNotFound = (id: string) =>
  new NotFoundException({
    code: ErrorCodes.AREA_NOT_FOUND,
    message: ErrorMessages[ErrorCodes.AREA_NOT_FOUND](),
    id,
  });
```
