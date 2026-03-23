---
id: controller-count
name: Count Endpoint
description: "GET with @ZodResponse(CountDto, 200), delegates to service.count(), no request body"
usage: "Use for GET count endpoints returning a single { count } object"
project: server
layer: controller
source: target/server/src/inbox-notification/inbox-notification.controller.ts:L41
---

# Count Endpoint

## When to use

Use for GET count endpoints returning a single { count } object

## Reference implementation

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '../common/decorators/api-error-responses.decorator';
import {
  InboxNotificationCountDto,
  PaginatedInboxNotificationDto,
} from './dto/inbox-notification.dto';

/**
 * @Blueprint controller-count
 * @BlueprintName Count Endpoint
 * @BlueprintUsage Use for GET count endpoints returning a single { count } object
 * @BlueprintDescription GET with @ZodResponse(CountDto, 200), delegates to service.count(), no request body
 */
@Get('count')
@ApiOperation({
  summary: 'Count pending inbox notifications',
  description:
    'Returns the total count of ASSIGNED approval tasks for the current user in the current company. ' +
    'Used for navigation badge display.',
})
@ApiInternalServerErrorResponse()
@ZodResponse({
  type: InboxNotificationCountDto,
  status: 200,
  description: 'Inbox notification count retrieved successfully',
})
async count(): Promise<InboxNotificationCountDto> {
  return this.inboxNotificationService.count();
}
```
