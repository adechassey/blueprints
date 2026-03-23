---
id: controller-update
name: Update Endpoint
description: "PUT /:id with @Param + @Body, returns 204 via @HttpCode(NO_CONTENT)"
usage: "Use for PUT /:id endpoints with partial update and 204 response"
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L130
---

# Update Endpoint

## When to use

Use for PUT /:id endpoints with partial update and 204 response

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
 * @Blueprint controller-update
 * @BlueprintName Update Endpoint
 * @BlueprintUsage Use for PUT /:id endpoints with partial update and 204 response
 * @BlueprintDescription PUT /:id with @Param + @Body, returns 204 via @HttpCode(NO_CONTENT)
 */
@Put(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Update area',
  description: 'Updates an existing area. All fields are optional (partial update).',
})
@ApiNoContentResponse('Area updated')
@ApiNotFoundResponse('Area not found')
@ApiBadRequestResponse('Validation failed or duplicate area name')
@ApiInternalServerErrorResponse()
async update(@Param() params: AreaIdParamDto, @Body() dto: UpdateAreaDto): Promise<void> {
  await this.areaService.update(params.id, dto);
}
```
