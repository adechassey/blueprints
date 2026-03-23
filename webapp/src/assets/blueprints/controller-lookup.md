---
id: controller-lookup
name: Lookup Endpoint
description: "GET /all with @Query DTO, returns array of LookupDto via @ZodResponse"
usage: Use for GET /all endpoints returning id/name pairs for dropdowns
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L63
---

# Lookup Endpoint

## When to use

Use for GET /all endpoints returning id/name pairs for dropdowns

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
 * @Blueprint controller-lookup
 * @BlueprintName Lookup Endpoint
 * @BlueprintUsage Use for GET /all endpoints returning id/name pairs for dropdowns
 * @BlueprintDescription GET /all with @Query DTO, returns array of LookupDto via @ZodResponse
 */
@Get('all')
@ApiOperation({
  summary: 'List all areas for dropdown',
  description:
    'Retrieves all areas in simplified {id, name} format for dropdowns. Defaults to active areas when status is not provided. Use status="all" to return both active and inactive entities. Requires at least one of: area:read, subarea:read, activity:read, budget_version:read.',
})
@ApiBadRequestResponse('Invalid query parameters')
@ApiInternalServerErrorResponse()
@ZodResponse({
  type: [AreaLookupDto],
  status: 200,
  description: 'All area lookups retrieved successfully',
})
async findAllLookups(@Query() query: QueryAllAreasDto): Promise<AreaLookupDto[]> {
  return this.areaService.findAllLookups(query);
}
```
