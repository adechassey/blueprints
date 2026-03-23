---
id: controller-lifecycle-patch-with-body
name: Lifecycle Patch Endpoint with Body
description: "PATCH endpoint with @Param and @Body DTOs, 204 No Content response, and thin delegation to a service lifecycle method"
usage: "Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition and require a small request body"
project: server
layer: controller
source: target/server/src/activity/activity.controller.ts:L224
---

# Lifecycle Patch Endpoint with Body

## When to use

Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition and require a small request body

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
  ActivityDetailDto,
  BudgetValidationResultDto,
  CancelActivityDto,
  CreateActivityDto,
  CreateActivityResultDto,
  PaginatedActivitiesDto,
  SegmentDto,
  TemplateFieldDto,
  UpdateActivityDto,
  ValidateBudgetIncreaseDto,
} from './dto/activity.dto';
import {
  ActivityIdParamDto,
  QueryActivitiesDto,
  TemplateIdParamDto,
} from './dto/query-activity.dto';

/**
 * @Blueprint controller-lifecycle-patch-with-body
 * @BlueprintName Lifecycle Patch Endpoint with Body
 * @BlueprintUsage Use for PATCH /:id/{action} endpoints that trigger a lifecycle transition and require a small request body
 * @BlueprintDescription PATCH endpoint with @Param and @Body DTOs, 204 No Content response, and thin delegation to a service lifecycle method
 */
@Patch(':id/cancel')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Cancel activity',
  description:
    'Transitions activity from created to canceled. ' +
    'Requires a mandatory cancellation reason.',
})
@ApiBadRequestResponse('Invalid status transition or missing reason')
@ApiNotFoundResponse('Activity not found')
@ApiForbiddenResponse('Missing ACTIVITY_UPDATE permission')
@ApiNoContentResponse('Activity canceled')
@ApiInternalServerErrorResponse()
async cancel(
  @Param() params: ActivityIdParamDto,
  @Body() body: CancelActivityDto
): Promise<void> {
  await this.activityService.cancel(params.id, body.reason);
}
```
