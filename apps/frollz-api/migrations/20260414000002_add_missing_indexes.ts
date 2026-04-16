import type { Knex } from "knex";

/**
 * Add indexes that were absent from earlier migrations.
 *
 * Rationale per index:
 *  film_state.film_id          — findByFilmId / findLatestByFilmId called on every film load
 *  film_state_metadata.film_state_id — joined in loadMetadata for every film_state
 *  note(entity_type, entity_id) — primary lookup pattern for NoteKnexRepository.findByEntityId
 *  camera_accepted_format.camera_id — joined in findAcceptedFormats for every camera load
 *  emulsion(format_id)          — findByFormatId, also a FK column (Postgres does not auto-index referencing side)
 *  emulsion(process_id)         — findByProcessId, FK column
 *  film(emulsion_id)            — findByEmulsionId, FK column
 *  transition_rule(profile_id)  — findByProfileId; not covered by the existing unique(from,to,profile) index
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("film_state", (t) => {
    t.index("film_id", "idx_film_state_film_id");
  });

  await knex.schema.alterTable("film_state_metadata", (t) => {
    t.index("film_state_id", "idx_film_state_metadata_film_state_id");
  });

  await knex.schema.alterTable("note", (t) => {
    t.index(["entity_type", "entity_id"], "idx_note_entity_type_entity_id");
  });

  await knex.schema.alterTable("camera_accepted_format", (t) => {
    t.index("camera_id", "idx_camera_accepted_format_camera_id");
  });

  await knex.schema.alterTable("emulsion", (t) => {
    t.index("format_id", "idx_emulsion_format_id");
    t.index("process_id", "idx_emulsion_process_id");
  });

  await knex.schema.alterTable("film", (t) => {
    t.index("emulsion_id", "idx_film_emulsion_id");
  });

  await knex.schema.alterTable("transition_rule", (t) => {
    t.index("profile_id", "idx_transition_rule_profile_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transition_rule", (t) => {
    t.dropIndex("profile_id", "idx_transition_rule_profile_id");
  });

  await knex.schema.alterTable("film", (t) => {
    t.dropIndex("emulsion_id", "idx_film_emulsion_id");
  });

  await knex.schema.alterTable("emulsion", (t) => {
    t.dropIndex("process_id", "idx_emulsion_process_id");
    t.dropIndex("format_id", "idx_emulsion_format_id");
  });

  await knex.schema.alterTable("camera_accepted_format", (t) => {
    t.dropIndex("camera_id", "idx_camera_accepted_format_camera_id");
  });

  await knex.schema.alterTable("note", (t) => {
    t.dropIndex(["entity_type", "entity_id"], "idx_note_entity_type_entity_id");
  });

  await knex.schema.alterTable("film_state_metadata", (t) => {
    t.dropIndex("film_state_id", "idx_film_state_metadata_film_state_id");
  });

  await knex.schema.alterTable("film_state", (t) => {
    t.dropIndex("film_id", "idx_film_state_film_id");
  });
}
