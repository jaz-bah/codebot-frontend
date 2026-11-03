import type { IMvcNode } from "@/types/global.type";

/**
 * Nest.js MVC tree: MVC is native — @Controller classes, @Injectable
 * services, entities/DTOs as models, one feature module bundling all
 * three. No views: Nest serves JSON (SSR templating lives elsewhere).
 */
export const nestjsMvcTree: IMvcNode = {
  name: "nest-api/",
  children: [
    {
      name: "src/",
      children: [
        {
          name: "app.module.ts",
          note: "# Root module — wires every feature",
          role: "shared",
        },
        {
          name: "modules/",
          children: [
            {
              name: "user/",
              note: "# One folder per feature",
              children: [
                {
                  name: "user.module.ts",
                  note: "# providers/imports/controllers",
                  role: "shared",
                },
                {
                  name: "user.controller.ts",
                  note: "# Routes + DTO validation (CONTROLLER)",
                  role: "controller",
                },
                {
                  name: "user.service.ts",
                  note: "# @Injectable — business logic",
                  role: "service",
                },
                {
                  name: "entities/",
                  note: "# user.entity.ts (MODEL)",
                  role: "model",
                },
                {
                  name: "dto/",
                  note: "# create-user.dto.ts (MODEL)",
                  role: "model",
                },
              ],
            },
            {
              name: "order/",
              note: "# …same controller/service/entities trio",
            },
          ],
        },
        {
          name: "common/",
          note: "# Cross-cutting concerns",
          role: "shared",
          children: [
            { name: "guards/", note: "# Auth/role (canActivate)" },
            { name: "pipes/", note: "# Validation + transform" },
            { name: "interceptors/", note: "# Logging, serialization" },
            { name: "filters/", note: "# Exception → response" },
            { name: "decorators/", note: "# Custom param decorators" },
          ],
        },
        {
          name: "config/",
          note: "# Type-safe env config",
          role: "shared",
        },
        {
          name: "main.ts",
          note: "# Bootstrap — port, CORS, pipes",
          role: "shared",
        },
      ],
    },
    {
      name: "prisma/",
      children: [
        {
          name: "schema.prisma",
          note: "# DB schema → generated client",
          role: "model",
        },
      ],
    },
    { name: ".env", note: "# Secrets — never commit", role: "shared" },
    { name: "nest-cli.json", note: "# Build config", role: "shared" },
    { name: "tsconfig.json", role: "shared" },
    { name: "package.json", role: "shared" },
  ],
};
