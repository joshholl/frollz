import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { AutoIncrementEntity } from './base.entity.js';
import { FilmStateEntity } from './reference.entities.js';
import { UserEntity } from './user.entity.js';
import { FilmEntity } from './film.entity.js';

@Entity({ tableName: 'film_frame' })
export class FilmFrameEntity extends AutoIncrementEntity {
  @ManyToOne(() => UserEntity, { fieldName: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => FilmEntity, { fieldName: 'film_id' })
  film!: FilmEntity;

  @Property({ type: 'integer', fieldName: 'frame_number' })
  frameNumber!: number;

  @Property({ type: 'float', fieldName: 'aperture', nullable: true })
  aperture: number | null = null;

  @Property({ type: 'float', fieldName: 'shutter_speed_seconds', nullable: true })
  shutterSpeedSeconds: number | null = null;

  @Property({ type: 'boolean', fieldName: 'filter_used', nullable: true })
  filterUsed: boolean | null = null;

  @ManyToOne(() => FilmStateEntity, { fieldName: 'current_state_id' })
  currentState!: FilmStateEntity;
}
