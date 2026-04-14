import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("camera", (t) => {
    t.increments("id").notNullable().primary();
    t.string("brand").notNullable();
    t.string("model").notNullable();
    t.string("serial_number").nullable();
    t.date("acquired_at").nullable();
    t.decimal("purchase_price", 10, 2).nullable();
    t.string("status").notNullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("camera");
}