import type { SQLiteDatabase } from 'expo-sqlite';

export async function initDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL,
      contact TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, destinationType TEXT NOT NULL,
      destinationId INTEGER, destinationName TEXT NOT NULL, address TEXT NOT NULL,
      covers INTEGER, plans INTEGER, notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL
    );
  `);
}
