import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    await knex("package").insert([
        {id: 1, name: "sheet"},
        {id: 2, name: "roll"},
        {id: 3, name: "bulk roll"},
        {id: 4, name: "instant"},
    ]).onConflict("id").ignore();
}