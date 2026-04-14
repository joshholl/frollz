import { Camera } from "../../../domain/camera/entities/camera.entity";
import { CameraRow } from "../types/db.types";

export class CameraMapper {
  static toDomain(row: CameraRow): Camera {
    return Camera.create({
      id: row.id,
      brand: row.brand,
      model: row.model,
      status: row.status as Camera['status'],
      serialNumber: row.serial_number ?? undefined,
      purchasePrice: row.purchase_price ?? undefined,
      acquiredAt: row.acquired_at ?? undefined,
    });
  }

  static toPersistence(camera: Camera): CameraRow {
    return {
      id: camera.id,
      brand: camera.brand,
      model: camera.model,
      status: camera.status as string,
      notes: camera.notes,
      serial_number: camera.serialNumber,
      purchase_price: camera.purchasePrice,
      acquired_at: camera.acquiredAt,
      created_at: camera.createdAt,
      updated_at: camera.updatedAt,
    };
  }
}
