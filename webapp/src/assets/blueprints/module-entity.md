---
id: module-entity
name: Entity Module
description: "@Module importing AuditLogModule, registering Controller + Service + Repository + PrismaService, exporting Service"
usage: "Use for NestJS module wiring Controller, Service, Repository, and PrismaService with AuditLogModule"
project: server
layer: module
source: target/server/src/area/area.module.ts:L9
---

# Entity Module

## When to use

Use for NestJS module wiring Controller, Service, Repository, and PrismaService with AuditLogModule

## Reference implementation

```typescript
import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { PrismaService } from '../prisma.service';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { AreaRepository } from './repository/area.repository';

/**
 * @Blueprint module-entity
 * @BlueprintName Entity Module
 * @BlueprintUsage Use for NestJS module wiring Controller, Service, Repository, and PrismaService with AuditLogModule
 * @BlueprintDescription @Module importing AuditLogModule, registering Controller + Service + Repository + PrismaService, exporting Service
 */
@Module({
  imports: [AuditLogModule],
  controllers: [AreaController],
  providers: [AreaService, AreaRepository, PrismaService],
  exports: [AreaService],
})
export class AreaModule {}
```
