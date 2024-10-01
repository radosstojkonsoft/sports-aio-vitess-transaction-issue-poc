import * as dotenv from 'dotenv';
import mysql, { Pool } from "mysql2/promise";

// load env variables as early as possible
dotenv.config();

function mustGetEnv(key: string): string {
  if (process.env[key] && typeof process.env[key] === 'string') {
    return process.env[key]!;
  }

  throw new Error(`key ${key} doesnt exist in env variables`);
}

// function getEnv(key: string, defaultVal: string): string {
//   if (process.env[key] && typeof process.env[key] === 'string') {
//     return process.env[key]!;
//   }

//   return defaultVal;
// }

export class DbConnection {
  static createPool(): Pool {
    const pool = mysql.createPool({
      namedPlaceholders: true,
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectionLimit: 20,
      host: mustGetEnv("DB_HOST"),
      port: Number(mustGetEnv("DB_PORT")),
      user: mustGetEnv("DB_USERNAME"),
      password: mustGetEnv("DB_PASSWORD"),
      // database: cfg.database,
    });

    return pool;
  }
}
