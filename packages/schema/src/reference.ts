import { z } from 'zod';
import { codeSchema, idSchema, labelSchema } from './common.js';

export const filmFormatCodes = [
  '35mm',
  '120',
  '220',
  '4x5',
  '2x3',
  '8x10',
  'InstaxMini',
  'InstaxWide',
  'InstaxSquare'
] as const;

export const developmentProcessCodes = ['C41', 'E6', 'ECN2', 'BW'] as const;
export const filmStateCodes = [
  'purchased',
  'stored',
  'loaded',
  'exposed',
  'removed',
  'sent_for_dev',
  'developed',
  'scanned',
  'archived'
] as const;
export const storageLocationCodes = ['freezer', 'refrigerator', 'shelf', 'other'] as const;
export const slotStateCodes = ['empty', 'loaded', 'exposed', 'removed'] as const;
export const receiverTypeCodes = ['camera', 'interchangeable_back', 'film_holder'] as const;
export const holderTypeCodes = ['standard', 'grafmatic', 'readyload', 'quickload'] as const;

export const filmFormatCodeSchema = z.enum(filmFormatCodes);
export const developmentProcessCodeSchema = z.enum(developmentProcessCodes);
export const filmStateCodeSchema = z.enum(filmStateCodes);
export const storageLocationCodeSchema = z.enum(storageLocationCodes);
export const slotStateCodeSchema = z.enum(slotStateCodes);
export const receiverTypeCodeSchema = z.enum(receiverTypeCodes);
export const holderTypeCodeSchema = z.enum(holderTypeCodes);

export const filmFormatSchema = z.object({
  id: idSchema,
  code: filmFormatCodeSchema,
  label: labelSchema
});

export const developmentProcessSchema = z.object({
  id: idSchema,
  code: developmentProcessCodeSchema,
  label: labelSchema
});

export const packageTypeSchema = z.object({
  id: idSchema,
  code: codeSchema,
  label: labelSchema,
  filmFormatId: idSchema,
  filmFormat: filmFormatSchema
});

export const filmStateSchema = z.object({
  id: idSchema,
  code: filmStateCodeSchema,
  label: labelSchema
});

export const storageLocationSchema = z.object({
  id: idSchema,
  code: storageLocationCodeSchema,
  label: labelSchema
});

export const slotStateSchema = z.object({
  id: idSchema,
  code: slotStateCodeSchema,
  label: labelSchema
});

export const receiverTypeSchema = z.object({
  id: idSchema,
  code: receiverTypeCodeSchema,
  label: labelSchema
});

export const holderTypeSchema = z.object({
  id: idSchema,
  code: holderTypeCodeSchema,
  label: labelSchema
});

export const emulsionSchema = z.object({
  id: idSchema,
  brand: z.string().min(1),
  manufacturer: z.string().min(1),
  isoSpeed: z.number().int().positive(),
  developmentProcessId: idSchema,
  developmentProcess: developmentProcessSchema,
  balance: z.string().min(1),
  filmFormats: z.array(filmFormatSchema)
});

export const referenceTablesSchema = z.object({
  filmFormats: z.array(filmFormatSchema),
  developmentProcesses: z.array(developmentProcessSchema),
  packageTypes: z.array(packageTypeSchema),
  filmStates: z.array(filmStateSchema),
  storageLocations: z.array(storageLocationSchema),
  slotStates: z.array(slotStateSchema),
  receiverTypes: z.array(receiverTypeSchema),
  holderTypes: z.array(holderTypeSchema),
  emulsions: z.array(emulsionSchema)
});

export type FilmFormat = z.infer<typeof filmFormatSchema>;
export type DevelopmentProcess = z.infer<typeof developmentProcessSchema>;
export type PackageType = z.infer<typeof packageTypeSchema>;
export type FilmState = z.infer<typeof filmStateSchema>;
export type StorageLocation = z.infer<typeof storageLocationSchema>;
export type SlotState = z.infer<typeof slotStateSchema>;
export type ReceiverType = z.infer<typeof receiverTypeSchema>;
export type HolderType = z.infer<typeof holderTypeSchema>;
export type Emulsion = z.infer<typeof emulsionSchema>;
export type ReferenceTables = z.infer<typeof referenceTablesSchema>;
