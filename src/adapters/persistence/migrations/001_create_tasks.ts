import type { Knex } from "knex";

const TABLE_NAME = "tasks";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.text("id").primary();
    table.text("title").notNullable();
    table.text("description").nullable();
    table.integer("priority").nullable();
    table.text("status").notNullable();
    table.text("created_at").notNullable();
    table.text("updated_at").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME);
}
