import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRollStateDto } from './dto/create-roll-state.dto';
import { RollStateHistory } from './entities/roll-state.entity';

@Injectable()
export class RollStateService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateRollStateDto): Promise<RollStateHistory> {
    const collection = this.databaseService.getCollection('roll_states');
    const now = new Date();

    const record: Omit<RollStateHistory, '_key'> = {
      stateId: crypto.randomUUID(),
      rollId: dto.rollKey,
      state: dto.state,
      date: dto.date ?? now,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.save(record);
    return { ...record, _key: result._key };
  }

  async findByRollKey(rollKey: string): Promise<RollStateHistory[]> {
    const cursor = await this.databaseService.query(
      `FOR s IN roll_states FILTER s.rollId == @rollKey SORT s.date ASC RETURN s`,
      { rollKey },
    );
    return await cursor.all();
  }
}
