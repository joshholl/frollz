import { Migration } from '@mikro-orm/migrations';

export class Migration20260502200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('ALTER TABLE "film_frame" ADD COLUMN "aperture" double precision NULL;');
    this.addSql('ALTER TABLE "film_frame" ADD COLUMN "shutter_speed_seconds" double precision NULL;');
    this.addSql('ALTER TABLE "film_frame" ADD COLUMN "filter_used" boolean NULL;');
  }

  override async down(): Promise<void> {
    this.addSql('ALTER TABLE "film_frame" DROP COLUMN "aperture";');
    this.addSql('ALTER TABLE "film_frame" DROP COLUMN "shutter_speed_seconds";');
    this.addSql('ALTER TABLE "film_frame" DROP COLUMN "filter_used";');
  }
}
