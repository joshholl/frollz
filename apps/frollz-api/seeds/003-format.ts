import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    await knex("format").insert([
      {id: 1, package_id: 2, name: '35mm Stills'},
      {id: 2, package_id: 2, name: '120 Medium Format'},
      {id: 3, package_id: 2, name: '220 Medium Format'},
      {id: 4, package_id: 3, name: '35mm Bulk Roll'},
      {id: 5, package_id: 1, name: '4x5 Sheet'},
      {id: 6, package_id: 1, name: '8x10 Sheet'},
      {id: 7, package_id: 4, name: 'Polaroid 600'},
      {id: 8, package_id: 4, name: 'Polaroid SX-70'},
      {id: 9, package_id: 4, name: 'Fujifilm Instax Mini'},
      {id: 10, package_id: 4, name: 'Fujifilm Instax Wide'},
      {id: 11, package_id: 4, name: 'Fujifilm Instax Square'},
    ]).onConflict("id").ignore();
}