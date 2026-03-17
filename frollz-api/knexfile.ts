import type { Knex } from "knex";
import * as path from "path";

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? "5432"),
    database: process.env.POSTGRES_DATABASE ?? "frollz",
    user: process.env.POSTGRES_USER ?? "frollz",
    password: process.env.POSTGRES_PASSWORD ?? "frollz",
  },
  migrations: {
    directory: path.join(__dirname, "migrations"),
    loadExtensions: [".ts", ".js"],
  },
};

export default config;
