import type { IMvcNode } from "@/types/global.type";

/**
 * Express.js MVC tree: MVC is manual — routes map URLs to thin
 * controllers, controllers call services, services use models.
 * Views are optional (API-only apps skip them).
 */
export const expressjsMvcTree: IMvcNode = {
  name: "express-api/",
  children: [
    {
      name: "src/",
      children: [
        { name: "server.ts", note: "# Boot the HTTP server", role: "shared" },
        {
          name: "app.ts",
          note: "# express() — middleware order",
          role: "shared",
        },
        {
          name: "routes/",
          children: [
            {
              name: "v1/",
              children: [
                {
                  name: "user.routes.ts",
                  note: "# URL → controller (CONTROLLER)",
                  role: "controller",
                },
                {
                  name: "order.routes.ts",
                  role: "controller",
                },
              ],
            },
          ],
        },
        {
          name: "controllers/",
          note: "# Thin (req, res) handlers",
          role: "controller",
          children: [{ name: "user.controller.ts" }],
        },
        {
          name: "models/",
          note: "# Mongoose schemas (MODEL)",
          role: "model",
          children: [{ name: "user.model.ts" }],
        },
        {
          name: "services/",
          note: "# Business logic",
          role: "service",
          children: [{ name: "user.service.ts" }],
        },
        {
          name: "middleware/",
          note: "# auth, errors, rate-limit",
          role: "shared",
        },
        {
          name: "validators/",
          note: "# zod/joi request schemas",
          role: "shared",
          children: [{ name: "user.schema.ts" }],
        },
        {
          name: "config/",
          note: "# DB + env config",
          role: "shared",
        },
        {
          name: "utils/",
          note: "# Pure helpers",
          role: "shared",
        },
        {
          name: "types/",
          note: "# Request augmentation (req.user…)",
          role: "shared",
          children: [{ name: "express.d.ts" }],
        },
      ],
    },
    {
      name: "views/",
      note: "# Optional — pug/ejs templates (VIEW)",
      role: "view",
    },
    { name: ".env", note: "# Secrets — never commit", role: "shared" },
    { name: "package.json", role: "shared" },
  ],
};
