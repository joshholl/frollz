import { ApiBody, type ApiBodyOptions } from "@nestjs/swagger";
import { z } from "zod";

/**
 * Generates @ApiBody Swagger metadata from a Zod schema.
 * Uses z.toJsonSchema() — built into Zod v4, no external package needed.
 */
export function ApiZodBody(
  schema: z.ZodSchema,
  options: Partial<ApiBodyOptions> = {},
) {
  return ApiBody({ schema: z.toJSONSchema(schema) as object, ...options });
}
