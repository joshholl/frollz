import { randomUUID } from "node:crypto";
import type { Knex } from "knex";

// State machine tables, FK additions to film/film_state, and essential seed data.
// UUIDs are generated in TypeScript — no DB-level defaults needed since the
// application always provides IDs on insert.

export async function up(knex: Knex): Promise<void> {
  // transition_state -------------------------------------------------------
  await knex.schema.createTable("transition_state", (t) => {
    t.uuid("id").primary();
    t.text("name").notNullable().unique();
  });

  // transition_profile -----------------------------------------------------
  await knex.schema.createTable("transition_profile", (t) => {
    t.uuid("id").primary();
    t.text("name").notNullable().unique();
  });

  // transition_rule --------------------------------------------------------
  // to_state stores the UUID of the destination transition_state.
  // Named "to_state" (not "to_state_id") to match the TransitionRuleRow interface.
  await knex.schema.createTable("transition_rule", (t) => {
    t.uuid("id").primary();
    t.uuid("from_state_id")
      .notNullable()
      .references("id")
      .inTable("transition_state")
      .onDelete("CASCADE");
    t.uuid("to_state")
      .notNullable()
      .references("id")
      .inTable("transition_state")
      .onDelete("CASCADE");
    t.uuid("profile_id")
      .notNullable()
      .references("id")
      .inTable("transition_profile")
      .onDelete("CASCADE");
    t.unique(["from_state_id", "to_state", "profile_id"]);
  });

  // transition_metadata_field ----------------------------------------------
  await knex.schema.createTable("transition_metadata_field", (t) => {
    t.uuid("id").primary();
    t.text("name").notNullable().unique();
    t.text("field_type").notNullable(); // string | number | boolean | date
  });

  // transition_state_metadata ----------------------------------------------
  // Associates metadata fields with the destination state they belong to.
  await knex.schema.createTable("transition_state_metadata", (t) => {
    t.uuid("id").primary();
    t.uuid("field_id")
      .notNullable()
      .references("id")
      .inTable("transition_metadata_field")
      .onDelete("CASCADE");
    t.uuid("transition_state_id")
      .notNullable()
      .references("id")
      .inTable("transition_state")
      .onDelete("CASCADE");
    t.text("default_value").nullable();
    t.unique(["field_id", "transition_state_id"]);
  });

  // film_state_metadata ----------------------------------------------------
  // Records which metadata fields were captured when a film_state was entered.
  await knex.schema.createTable("film_state_metadata", (t) => {
    t.uuid("id").primary();
    t.text("film_state_id")
      .notNullable()
      .references("id")
      .inTable("film_state")
      .onDelete("CASCADE");
    t.uuid("transition_state_metadata_id")
      .notNullable()
      .references("id")
      .inTable("transition_state_metadata")
      .onDelete("CASCADE");
  });

  // Add transition_profile_id to film (no existing rows on fresh schema) ---
  await knex.schema.alterTable("film", (t) => {
    t.uuid("transition_profile_id")
      .notNullable()
      .references("id")
      .inTable("transition_profile")
      .onDelete("RESTRICT");
  });

  // Add FK from film_state.state_id to transition_state --------------------
  await knex.schema.alterTable("film_state", (t) => {
    t.foreign("state_id").references("id").inTable("transition_state").onDelete("RESTRICT");
  });

  // -----------------------------------------------------------------------
  // Seed: states
  // -----------------------------------------------------------------------
  const stateNames = [
    "Added",
    "Frozen",
    "Refrigerated",
    "Shelved",
    "Loaded",
    "Finished",
    "Sent For Development",
    "Developed",
    "Received",
  ];
  const stateRows = stateNames.map((name) => ({ id: randomUUID(), name }));
  await knex("transition_state").insert(stateRows);

  const stateId = (name: string) => stateRows.find((s) => s.name === name)!.id;

  // -----------------------------------------------------------------------
  // Seed: profiles
  // -----------------------------------------------------------------------
  const profileRows = [
    { id: randomUUID(), name: "standard" },
    { id: randomUUID(), name: "instant" },
    { id: randomUUID(), name: "bulk" },
  ];
  await knex("transition_profile").insert(profileRows);

  const profileId = (name: string) =>
    profileRows.find((p) => p.name === name)!.id;

  const std = profileId("standard");
  const inst = profileId("instant");
  const bulk = profileId("bulk");

  // -----------------------------------------------------------------------
  // Seed: rules
  // -----------------------------------------------------------------------
  type RuleRow = { id: string; from_state_id: string; to_state: string; profile_id: string };

  const rules: RuleRow[] = [
    // --- standard: forward ------------------------------------------------
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Frozen"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Refrigerated"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Shelved"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Refrigerated"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Shelved"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Shelved"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Loaded"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Finished"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Finished"), to_state: stateId("Sent For Development"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Sent For Development"), to_state: stateId("Developed"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Developed"), to_state: stateId("Received"), profile_id: std },
    // --- standard: backward -----------------------------------------------
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Added"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Frozen"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Added"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Refrigerated"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Frozen"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Shelved"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Refrigerated"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Frozen"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Finished"), to_state: stateId("Loaded"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Sent For Development"), to_state: stateId("Finished"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Developed"), to_state: stateId("Sent For Development"), profile_id: std },
    { id: randomUUID(), from_state_id: stateId("Received"), to_state: stateId("Developed"), profile_id: std },

    // --- instant: forward (skips lab; Finished → Received directly) -------
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Frozen"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Refrigerated"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Shelved"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Refrigerated"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Shelved"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Shelved"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Loaded"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Finished"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Finished"), to_state: stateId("Received"), profile_id: inst },
    // --- instant: backward ------------------------------------------------
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Added"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Frozen"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Added"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Refrigerated"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Frozen"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Shelved"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Refrigerated"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Frozen"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Finished"), to_state: stateId("Loaded"), profile_id: inst },
    { id: randomUUID(), from_state_id: stateId("Received"), to_state: stateId("Finished"), profile_id: inst },

    // --- bulk: forward (storage + loading only, no lab chain) -------------
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Frozen"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Refrigerated"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Added"), to_state: stateId("Shelved"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Refrigerated"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Shelved"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Shelved"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Loaded"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Finished"), profile_id: bulk },
    // --- bulk: backward ---------------------------------------------------
    { id: randomUUID(), from_state_id: stateId("Frozen"), to_state: stateId("Added"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Frozen"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Refrigerated"), to_state: stateId("Added"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Refrigerated"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Shelved"), to_state: stateId("Frozen"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Shelved"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Refrigerated"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Loaded"), to_state: stateId("Frozen"), profile_id: bulk },
    { id: randomUUID(), from_state_id: stateId("Finished"), to_state: stateId("Loaded"), profile_id: bulk },
  ];

  await knex("transition_rule").insert(rules);

  // -----------------------------------------------------------------------
  // Seed: metadata fields
  // -----------------------------------------------------------------------
  const fieldRows = [
    { id: randomUUID(), name: "temperature", field_type: "number" },
    { id: randomUUID(), name: "shotISO", field_type: "number" },
    { id: randomUUID(), name: "labName", field_type: "string" },
    { id: randomUUID(), name: "deliveryMethod", field_type: "string" },
    { id: randomUUID(), name: "processRequested", field_type: "string" },
    { id: randomUUID(), name: "pushPullStops", field_type: "number" },
    { id: randomUUID(), name: "scansReceived", field_type: "boolean" },
    { id: randomUUID(), name: "scansUrl", field_type: "string" },
    { id: randomUUID(), name: "negativesReceived", field_type: "boolean" },
    { id: randomUUID(), name: "negativesDate", field_type: "date" },
  ];
  await knex("transition_metadata_field").insert(fieldRows);

  const fieldId = (name: string) => fieldRows.find((f) => f.name === name)!.id;

  // -----------------------------------------------------------------------
  // Seed: state metadata associations
  // -----------------------------------------------------------------------
  await knex("transition_state_metadata").insert([
    { id: randomUUID(), field_id: fieldId("temperature"), transition_state_id: stateId("Frozen"), default_value: null },
    { id: randomUUID(), field_id: fieldId("temperature"), transition_state_id: stateId("Refrigerated"), default_value: null },
    { id: randomUUID(), field_id: fieldId("shotISO"), transition_state_id: stateId("Finished"), default_value: null },
    { id: randomUUID(), field_id: fieldId("labName"), transition_state_id: stateId("Sent For Development"), default_value: null },
    { id: randomUUID(), field_id: fieldId("deliveryMethod"), transition_state_id: stateId("Sent For Development"), default_value: null },
    { id: randomUUID(), field_id: fieldId("processRequested"), transition_state_id: stateId("Sent For Development"), default_value: null },
    { id: randomUUID(), field_id: fieldId("pushPullStops"), transition_state_id: stateId("Sent For Development"), default_value: null },
    { id: randomUUID(), field_id: fieldId("scansReceived"), transition_state_id: stateId("Received"), default_value: null },
    { id: randomUUID(), field_id: fieldId("scansUrl"), transition_state_id: stateId("Received"), default_value: null },
    { id: randomUUID(), field_id: fieldId("negativesReceived"), transition_state_id: stateId("Received"), default_value: null },
    { id: randomUUID(), field_id: fieldId("negativesDate"), transition_state_id: stateId("Received"), default_value: null },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("film_state_metadata");
  await knex.schema.dropTableIfExists("transition_state_metadata");
  await knex.schema.dropTableIfExists("transition_metadata_field");

  await knex.schema.alterTable("film_state", (t) => {
    t.dropForeign(["state_id"]);
  });

  await knex.schema.alterTable("film", (t) => {
    t.dropColumn("transition_profile_id");
  });

  await knex.schema.dropTableIfExists("transition_rule");
  await knex.schema.dropTableIfExists("transition_profile");
  await knex.schema.dropTableIfExists("transition_state");
}
