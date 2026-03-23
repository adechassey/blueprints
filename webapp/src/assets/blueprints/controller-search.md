---
id: controller-search
name: Search Endpoint
description: "POST /search with @Body query DTO, returns PaginatedDto via @ZodResponse"
usage: Use for paginated list endpoints with filtering/sorting via POST /search
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L38
---

# Search Endpoint

## When to use

Use for paginated list endpoints with filtering/sorting via POST /search

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
 * @Blueprint controller-search
 * @BlueprintName Search Endpoint
 * @BlueprintUsage Use for paginated list endpoints with filtering/sorting via POST /search
 * @BlueprintDescription POST /search with @Body query DTO, returns PaginatedDto via @ZodResponse
 */
@Post('search')
@ApiOperation({
  summary: 'List areas',
  description:
    'Retrieves paginated list of areas with filtering and sorting. ' +
    'Accepts filters array and sort string in request body. ' +
    'Results are scoped to the current company.',
})
@ApiBadRequestResponse('Invalid query parameters')
@ApiInternalServerErrorResponse()
@ZodResponse({
  type: PaginatedAreasDto,
  status: 200,
  description: 'Areas retrieved successfully',
})
async find(@Body() query: QueryAreasDto): Promise<PaginatedAreasDto> {
  return this.areaService.find(query);
}
```
