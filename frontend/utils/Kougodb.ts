// src/lib/db.ts
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const DB_NAME = "JapKougo.db"; // must match the filename you copy into /SQLite

export async function openKougoDB() {
  // Return cached instance
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Load the asset
    const asset = Asset.fromModule(require("../assets/JapKougo.db"));
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error("Asset local URI is null");
    }

    // Check the asset file
    const assetInfo = await FileSystem.getInfoAsync(asset.localUri);
    if (!assetInfo.exists) {
      throw new Error("Asset file does not exist at: " + asset.localUri);
    }

    // Create SQLite directory
    const sqliteDir = FileSystem.documentDirectory + "SQLite";
    const dbPath = `${sqliteDir}/${DB_NAME}`;

    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }

    // Copy the database file
    const destInfo = await FileSystem.getInfoAsync(dbPath);
    if (!destInfo.exists) {
      console.log("Copying database from assets...");
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: dbPath,
      });
      console.log("Database copied successfully");
    }

    // Open the database
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    return dbInstance;
  } catch (error) {
    console.error("Error in openKougoDB:", error);
    throw error;
  }
}

export function closeKougoDB() {
  if (!dbInstance) return;
  try {
    dbInstance.closeSync();
    dbInstance = null;
  } catch (e) {
    console.error("Error closing database:", e);
  }
}

export async function resetKougoDB() {
  closeKougoDB();
  // Delete the file under /SQLite, then re-open (will re-copy from assets)
  const sqliteDir = FileSystem.documentDirectory + "SQLite";
  const dbPath = `${sqliteDir}/${DB_NAME}`;
  const info = await FileSystem.getInfoAsync(dbPath);
  if (info.exists) await FileSystem.deleteAsync(dbPath, { idempotent: true });
  return openKougoDB();
}

// --- helpers ---
function listTables(db: SQLite.SQLiteDatabase) {
  try {
    const tables = db.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ) as Array<{ name: string }>;

    return tables;
  } catch (error) {
    console.log("Schema read error:", error);
    return [];
  }
}

// Helper to test database content
export function testDatabaseContent(db: SQLite.SQLiteDatabase) {
  try {
    const tables = listTables(db);

    if (tables.length > 0) {
      const firstTable = tables[0].name;

      // Get table structure
      const columns = db.getAllSync(`PRAGMA table_info(${firstTable})`);

      // Get sample data
      const sample = db.getAllSync(`SELECT * FROM ${firstTable} LIMIT 3`);

      return { tables, columns, sample };
    } else {
      return { tables: [], columns: [], sample: [] };
    }
  } catch (error) {
    console.error("Error testing database content:", error);
    return { tables: [], columns: [], sample: [] };
  }
}
