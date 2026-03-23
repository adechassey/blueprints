---
id: wide-event-logging
name: Wide Event Logging
description: "logger.assign with entityId and action from LogAction type, fields accumulate in wide event"
usage: Use for adding business context to the request-scoped canonical log line via logger.assign
project: server
layer: service
source: target/server/src/area/area.service.ts:L105
---

# Wide Event Logging

## When to use

Use for adding business context to the request-scoped canonical log line via logger.assign

## Reference implementation

```typescript
/**
 * @Blueprint wide-event-logging
 * @BlueprintName Wide Event Logging
 * @BlueprintUsage Use for adding business context to the request-scoped canonical log line via logger.assign
 * @BlueprintDescription logger.assign with entityId and action from LogAction type, fields accumulate in wide event
 */
this.logger.assign({ areaId: result.id, action: 'area.create' });
```
