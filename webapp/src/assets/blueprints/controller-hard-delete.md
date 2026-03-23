---
id: controller-hard-delete
name: Hard Delete Endpoint
description: "DELETE /:id/hard with @Param, returns 204 via @HttpCode(NO_CONTENT)"
usage: "Use for DELETE /:id/hard endpoints with 204 response"
project: server
layer: controller
source: target/server/src/area/area.controller.ts:L150
---

# Hard Delete Endpoint

## When to use

Use for DELETE /:id/hard endpoints with 204 response

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
import { AreaIdParamDto, QueryAllAreasDto, QueryAreasDto } from './dto/query-area.dto';

/**
 * @Blueprint controller-hard-delete
 * @BlueprintName Hard Delete Endpoint
 * @BlueprintUsage Use for DELETE /:id/hard endpoints with 204 response
 * @BlueprintDescription DELETE /:id/hard with @Param, returns 204 via @HttpCode(NO_CONTENT)
 */
@Delete(':id/hard')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Permanently delete area',
  description:
    'Permanently removes an area and all associated subareas. This action cannot be undone.',
})
@ApiNoContentResponse('Area permanently deleted')
@ApiNotFoundResponse('Area not found')
@ApiBadRequestResponse('Cannot delete area with dependent records')
@ApiInternalServerErrorResponse()
async hardDelete(@Param() params: AreaIdParamDto): Promise<void> {
  await this.areaService.delete(params.id);
}
```
