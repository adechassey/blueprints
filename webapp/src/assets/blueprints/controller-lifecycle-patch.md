---
id: controller-lifecycle-patch
name: Lifecycle Patch Endpoint
description: "PATCH endpoint with @Param DTO, 204 No Content response, and thin delegation to a service lifecycle method"
usage: "Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition without a request body"
project: server
layer: controller
source: target/server/src/activity/activity.controller.ts:L250
---

# Lifecycle Patch Endpoint

## When to use

Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition without a request body

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
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-error-responses.decorator';
import {
  ActivityIdParamDto,
  QueryActivitiesDto,
  TemplateIdParamDto,
} from './dto/query-activity.dto';

/**
 * @Blueprint controller-lifecycle-patch
 * @BlueprintName Lifecycle Patch Endpoint
 * @BlueprintUsage Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition without a request body
 * @BlueprintDescription PATCH endpoint with @Param DTO, 204 No Content response, and thin delegation to a service lifecycle method
 */
@Patch(':id/return-to-creation')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Return activity to creation',
  description: 'Transitions activity from rejected back to created.',
})
@ApiBadRequestResponse('Invalid status transition')
@ApiNotFoundResponse('Activity not found')
@ApiForbiddenResponse('Missing ACTIVITY_UPDATE permission')
@ApiNoContentResponse('Activity returned to creation')
@ApiInternalServerErrorResponse()
async returnToCreation(@Param() params: ActivityIdParamDto): Promise<void> {
  await this.activityService.returnToCreation(params.id);
}
```
