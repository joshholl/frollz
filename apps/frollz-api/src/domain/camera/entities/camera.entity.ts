import { Format } from "../../shared/entities/format.entity";

export type CameraStatus = "active" | "retired" | "in_repair";

export class CameraAcceptedFormats {
  constructor(
    public readonly id: number,
    public readonly cameraId: number,
    public readonly formatId: number,
    public readonly format?: Format,
  ) {}

  static create(props: {
    id?: number;
    cameraId: number;
    formatId: number;
    format?: Format;
  }): CameraAcceptedFormats {
    return new CameraAcceptedFormats(
      props.id ?? 0,
      props.cameraId,
      props.formatId,
      props.format,
    );
  }
}

export class Camera {
  constructor(
    public readonly id: number,
    public readonly brand: string,
    public readonly model: string,
    public readonly status: CameraStatus,
    public readonly acceptedFormats: CameraAcceptedFormats[] = [],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly notes?: string,
    public readonly serialNumber?: string,
    public readonly purchasePrice?: number,
    public readonly acquiredAt?: string,
  ) {}

  static create(props: {
    id?: number;
    brand: string;
    model: string;
    status: CameraStatus;
    acceptedFormats?: CameraAcceptedFormats[];
    createdAt?: Date | string | number;
    updatedAt?: Date | string | number;
    notes?: string;
    serialNumber?: string;
    purchasePrice?: number;
    acquiredAt?: string;
  }): Camera {
    const now = new Date();

    const toDate = (value?: Date | string | number): Date | undefined => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    };

    return new Camera(
      props.id ?? 0,
      props.brand,
      props.model,
      props.status,
      props.acceptedFormats ?? [],
      toDate(props.createdAt) ?? now,
      toDate(props.updatedAt) ?? now,
      props.notes,
      props.serialNumber,
      props.purchasePrice,
      props.acquiredAt,
    );
  }
}
