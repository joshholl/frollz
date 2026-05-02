import { Migration } from '@mikro-orm/migrations';

export class Migration20260502100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table `film_device` add column `frame_size_new` text null;');
    this.addSql('update `film_device` set `frame_size_new` = `frame_size`;');
    this.addSql('alter table `film_device` drop column `frame_size`;');
    this.addSql('alter table `film_device` rename column `frame_size_new` to `frame_size`;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table `film_device` add column `frame_size_old` text null;');
    this.addSql("update `film_device` set `frame_size_old` = coalesce(`frame_size`, '');");
    this.addSql('alter table `film_device` drop column `frame_size`;');
    this.addSql('alter table `film_device` rename column `frame_size_old` to `frame_size`;');
  }
}
