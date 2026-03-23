---
id: controller-find-one
name: Find One Endpoint
description: "GET /:id with @Param IdDto, returns EntityDto via @ZodResponse with @ApiNotFoundResponse"
usage: "Use for GET /:id endpoints returning a single entity"
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L86
---

# Find One Endpoint

## When to use

Use for GET /:id endpoints returning a single entity

## Reference implementation

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-error-responses.decorator';
import {
  AreaDto,
  AreaLookupDto,
  CreateAreaDto,
  CreateAreaResultDto,
  PaginatedAreasDto,
  UpdateAreaDto,
} from './dto/area.dto';
import { AreaIdParamDto, QueryAllAreasDto, QueryAreasDto } from './dto/query-area.dto';

/**
 * @Blueprint controller-find-one
 * @BlueprintName Find One Endpoint
 * @BlueprintUsage Use for GET /:id endpoints returning a single entity
 * @BlueprintDescription GET /:id with @Param IdDto, returns EntityDto via @ZodResponse with @ApiNotFoundResponse
 */
@Get(':id')
@ApiOperation({
  summary: 'Get area by ID',
  description: 'Retrieves a single area by its ID',
})
@ApiNotFoundResponse('Area not found')
@ApiInternalServerErrorResponse()
@ZodResponse({
  type: AreaDto,
  status: 200,
  description: 'Area details',
})
async findOne(@Param() params: AreaIdParamDto): Promise<AreaDto> {
  return this.areaService.findOneOrThrow(params.id);
}
```
