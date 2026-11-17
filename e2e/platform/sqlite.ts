// Browser E2E substitute for expo-sqlite (Metro alias under TABI_E2E=1).
// Everything is the real expo-sqlite web build (wa-sqlite) except
// withExclusiveTransactionAsync, which expo-sqlite does not support on web.
// It is emulated with the native semantics the app has to cope with:
// - the transaction runs on its own connection, where foreign_keys is OFF;
// - while it holds the write lock, writes from the main connection fail with
//   "database is locked".
// One difference remains: reads on the main connection can see uncommitted
// rows, whereas native WAL readers only see committed ones.
import { openDatabaseAsync as openRealDatabaseAsync } from 'expo-sqlite'
import type { SQLiteDatabase } from 'expo-sqlite'

export * from 'expo-sqlite'

type Task = (transaction: SQLiteDatabase) => Promise<void>

export async function openDatabaseAsync(
  ...args: Parameters<typeof openRealDatabaseAsync>
): Promise<SQLiteDatabase> {
  const db = await openRealDatabaseAsync(...args)
  const execAsync = db.execAsync.bind(db)
  const runAsync = db.runAsync.bind(db)
  const holder: { transaction: SQLiteDatabase | null } = { transaction: null }

  const guard =
    <Args extends unknown[], Result>(
      write: (...input: Args) => Promise<Result>,
      owner: () => SQLiteDatabase,
    ) =>
    (...input: Args): Promise<Result> => {
      if (holder.transaction && holder.transaction !== owner()) {
        return Promise.reject(new Error('database is locked'))
      }
      return write(...input)
    }

  const transaction: SQLiteDatabase = Object.create(db)
  Object.assign(transaction, {
    execAsync: guard(execAsync, () => transaction),
    runAsync: guard(runAsync, () => transaction),
  })
  Object.assign(db, {
    execAsync: guard(execAsync, () => db),
    runAsync: guard(runAsync, () => db),
    withExclusiveTransactionAsync: async (task: Task) => {
      if (holder.transaction) {
        throw new Error('database is locked')
      }
      const foreignKeys = await db.getFirstAsync<{ foreign_keys: number }>(
        'PRAGMA foreign_keys',
      )
      await execAsync('PRAGMA foreign_keys = OFF; BEGIN EXCLUSIVE')
      holder.transaction = transaction
      try {
        await task(transaction)
        await execAsync('COMMIT')
      } catch (error) {
        await execAsync('ROLLBACK').catch(() => undefined)
        throw error
      } finally {
        holder.transaction = null
        await execAsync(
          `PRAGMA foreign_keys = ${foreignKeys?.foreign_keys ? 'ON' : 'OFF'}`,
        )
      }
    },
  })
  return db
}
