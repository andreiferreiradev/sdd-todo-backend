import knex, { type Knex } from "knex";
import {
  getDatabaseConfig,
  getKnexConfig,
  type DatabaseConfig,
} from "../../config/database.js";

export function createKnexConnection(
  config: DatabaseConfig = getDatabaseConfig(),
): Knex {
  return knex(getKnexConfig(config));
}
