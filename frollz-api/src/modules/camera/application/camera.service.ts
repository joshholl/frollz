import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMERA_REPOSITORY, ICameraRepository } from '../../../domain/camera/repositories/camera.repository.interface';
import { CreateCameraDto } from '../dto/CreateCameraDto';
import { UpdateCameraDto } from '../dto/UpdateCameraDto';
import { FilterCameraDto } from '../dto/FilterCameraDto';
import { Camera } from '../../../domain/camera/entities/camera.entity';

@Injectable()
export class CameraService {
  constructor(
    @Inject(CAMERA_REPOSITORY) private readonly cameraRepo: ICameraRepository,
  ) { }
  async findAll(filter: FilterCameraDto): Promise<Camera[]> {
    return this.cameraRepo.findAll({ ...filter });
  }
  async delete(id: number): Promise<void> {
    return this.cameraRepo.delete(id);
  }

  async update(id: number, dto: UpdateCameraDto) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Camera with ID ${id} not found`);
    }
    const updated = Camera.create({
      id: existing.id,
      brand: dto.brand ?? existing.brand,
      model: dto.model ?? existing.model,
      status: dto.status ?? existing.status,
      notes: dto.notes ?? existing.notes,
      serialNumber: dto.serial_number ?? existing.serialNumber,
      purchasePrice: dto.purchase_price ?? existing.purchasePrice,
      acquiredAt: dto.acquired_at ?? existing.acquiredAt,
    });
    await this.cameraRepo.update(updated)
    return this.findById(id);
  }

  async create(dto: CreateCameraDto): Promise<Camera> {
    const cameraId = await this.cameraRepo.save(
      Camera.create({
        brand: dto.brand,
        model: dto.model,
        status: dto.status,
        notes: dto.notes,
        serialNumber: dto.serial_number,
        purchasePrice: dto.purchase_price,
        acquiredAt: dto.acquired_at,
      })
    );
    return this.findById(cameraId);

  }
  async findById(id: number): Promise<Camera> {
    const camera = await this.cameraRepo.findById(id);
    if (!camera) {
      throw new NotFoundException(`Camera with ID ${id} not found`);
    }
    return camera;
  }
}
