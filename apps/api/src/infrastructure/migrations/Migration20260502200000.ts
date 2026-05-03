import { Migration } from '@mikro-orm/migrations';

export class Migration20260502200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('ALTER TABLE `film_frame` ADD COLUMN `aperture` REAL NULL;');
    this.addSql('ALTER TABLE `film_frame` ADD COLUMN `shutter_speed_seconds` REAL NULL;');
    this.addSql('ALTER TABLE `film_frame` ADD COLUMN `filter_used` INTEGER NULL;');
  }
}
