import { Pool, PoolConnection } from 'mysql2/promise';
import { DbConnection } from '../infrastructure/db_connection.js';
import { getHex } from '../utility/ulid.js';
import { Bet, Betslip } from '../domain/entity.js';
import { DBAdapter } from '../adapter/db_adapter.js';

(async () => {
  process.once('SIGINT', () => {
    console.log('got sigint, closing connection');
    void (async () => {
      await pool.end();
    })();
    process.exit(0);
  });

  const pool = DbConnection.createPool();

  const data = generateData(10);

  // const conn = await pool.getConnection()

  const promises = data.map((d) => insertDataIntoDb(undefined, pool, d));

  console.log(`Starting process of ${promises.length}`);

  const res = await Promise.allSettled(promises);
  const error = res.find((r) => r.status === 'rejected');
  if (error && error.status === 'rejected') {
    console.log(error.reason);
    throw error.reason as Error;
  }
  console.log('DONE');
  process.exit(0)

  async function insertDataIntoDb(
    connection: PoolConnection | undefined,
    pool: Pool,
    data: Betslip
  ) {
    const adapter = new DBAdapter(pool);

    try {
      await DBAdapter.startTransaction(connection, pool, async (conn) => {
        // await adapter.basicSelect(conn)

        const tProvider = await adapter.loadTenantProviderByName(
          'DEMO_PROVIDER_1',
          'DEMO_TENANT_1',
          conn
        );

        data.tenantProviderId = tProvider.id;

        await adapter.createBetslip(conn, data);

        await adapter.loadTenantProviderByName(
          'DEMO_PROVIDER_1',
          'DEMO_TENANT_1'
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  function generateData(amount: number): Betslip[] {
    const data: Betslip[] = [];

    for (let i = 0; i < amount; i++) {
      const betslipId = getHex();

      const bets: Bet[] = [];

      for (let j = 0; j < 2; j++) {
        const bet: Bet = {
          id: getHex(),
          betslipId: betslipId,
          providerBetId: getHex(),
          gameType: 'LIVE',
        };
        bets.push(bet);
      }

      const betslip: Betslip = {
        id: betslipId,
        providerBetslipId: getHex(),
        status: 'PROCESSING',
        language: 'hr',
        bets: bets,
      };

      data.push(betslip);
    }

    return data;
  }
})();
