import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    await knex("process").insert([
        {id: 1, name: "C-41 Color Negative"},
        {id: 2, name: "Black and White"},
        {id: 3, name: "ECN-2 Motion Picture"},
        {id: 4, name: "E-6 Color Positive"},
    ]).onConflict("id").ignore();
}