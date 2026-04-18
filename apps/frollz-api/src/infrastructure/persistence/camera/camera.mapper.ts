import {
  Camera,
  CameraAcceptedFormats,
} from "../../../domain/camera/entities/camera.entity";
import { Format } from "../../../domain/shared/entities/format.entity";
import { Package } from "../../../domain/shared/entities/package.entity";
import { CameraFormatJoinRow, CameraRow } from "../types/db.types";

export class CameraMapper {
  static toPersistence(camera: Camera): CameraRow {
    return {
      id: camera.id,
      brand: camera.brand,
      model: camera.model,
      status: camera.status as string,
      serial_number: camera.serialNumber,
      purchase_price: camera.purchasePrice,
      acquired_at: camera.acquiredAt,
      created_at: camera.createdAt,
      updated_at: camera.updatedAt,
    };
  }

  static toDomain(
    cameraRow: CameraRow,
    formatRows: CameraFormatJoinRow[] = [],
  ): Camera {
    const acceptedFormats: CameraAcceptedFormats[] = formatRows.map(
      this.toAcceptedFormatDomain,
    );

    const acquiredAt =
      cameraRow.acquired_at instanceof Date
        ? cameraRow.acquired_at.toISOString()
        : cameraRow.acquired_at
          ? new Date(cameraRow.acquired_at).toISOString()
          : undefined;

    const toDate = (value: Date | string | number | undefined | null): Date | undefined => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    };

    return Camera.create({
      id: cameraRow.id,
      brand: cameraRow.brand,
      model: cameraRow.model,
      status: cameraRow.status as Camera["status"],
      serialNumber: cameraRow.serial_number ?? undefined,
      purchasePrice: cameraRow.purchase_price ?? undefined,
      acquiredAt,
      createdAt: toDate(cameraRow.created_at),
      updatedAt: toDate(cameraRow.updated_at),
      acceptedFormats,
    });
  }

  static toAcceptedFormatDomain(
    formatRow: CameraFormatJoinRow,
  ): CameraAcceptedFormats {
    const pkg = Package.create({
      id: formatRow.package_id,
      name: formatRow.package_name,
    });

    const format = Format.create({
      id: formatRow.format_id,
      name: formatRow.format_name,
      packageId: formatRow.package_id,
      pkg,
    });

    return CameraAcceptedFormats.create({
      id: formatRow.id,
      cameraId: formatRow.camera_id,
      formatId: formatRow.format_id,
      format,
    });
  }
}
