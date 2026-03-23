---
id: controller-create
name: Create Endpoint
description: "POST / with @Body CreateDto, returns CreateResultDto via @ZodResponse(201)"
usage: Use for POST / endpoints creating an entity with 201 response
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L108
---

# Create Endpoint

## When to use

Use for POST / endpoints creating an entity with 201 response

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

/**
 * @Blueprint controller-create
 * @BlueprintName Create Endpoint
 * @BlueprintUsage Use for POST / endpoints creating an entity with 201 response
 * @BlueprintDescription POST / with @Body CreateDto, returns CreateResultDto via @ZodResponse(201)
 */
@Post()
@ApiOperation({
  summary: 'Create area',
  description: 'Creates a new area. Area name must be unique per company.',
})
@ApiBadRequestResponse('Validation failed or duplicate area name')
@ApiInternalServerErrorResponse()
@ZodResponse({
  type: CreateAreaResultDto,
  status: 201,
  description: 'Created area',
})
async create(@Body() dto: CreateAreaDto): Promise<CreateAreaResultDto> {
  return this.areaService.create(dto);
}
```
