import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { Betslip, TenantProvider } from '../domain/entity.js';

export class DBAdapter {
  static async startTransaction<T>(
    connection: PoolConnection | undefined,
    pool: Pool,
    work: (conn: PoolConnection) => Promise<T>
  ): Promise<T> {
    const conn = connection ?? (await pool.getConnection());
    console.log("Thread id ", conn.threadId);

    await conn.beginTransaction();

    try {
      console.log("Work started ", conn.threadId);
      const res = await work(conn);
      console.log("Work done ", conn.threadId);
      await conn.commit();
      console.log("Committed ", conn.threadId);
      return res;
    } catch (e: unknown) {
      console.log(e);

      await conn.rollback();
      throw e;
    } finally {
      conn.release();
      console.log("Release conn ", conn.threadId)
    }
  }
  static async startTransactionUseConnection<T>(
    conn: PoolConnection,
    work: (conn: PoolConnection) => Promise<T>
  ): Promise<T> {
    console.log("Thread id ", conn.threadId);

    await conn.beginTransaction();

    try {
      const res = await work(conn);
      await conn.commit();
      return res;
    } catch (e: unknown) {
      console.log(e);

      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  constructor(readonly pool: Pool) {}

  async basicSelect(conn: PoolConnection) {
    const res = await conn.query('SELECT 1');
    console.log(res);
    
  }

  async loadBetslipByProviderId(
    conn: PoolConnection,
    id: string,
    providerName: string
  ) {
    const betslipQuery = `
          SELECT
              HEX(provider_betslip_id) AS tpBetslipId,
          FROM
              sharded.betslip AS betslip
          JOIN
              unsharded.tenant_provider tp 
          ON
              betslip.tenant_provider_id = tp.id
          JOIN 
              unsharded.provider p 
          ON 
              p.id = tp.provider_id 
          WHERE
              betslip.id = UNHEX(:betslipId) AND p.name = :providerName;

        `;

    const res = await conn.query(betslipQuery, {
      betslipId: id,
      providerName: providerName,
    });

    return res[0];
  }

  async createBetslip(conn: PoolConnection, betslip: Betslip) {
    const betslipQuery = `
        INSERT INTO sharded.betslip (
            id,
            tenant_provider_id,
            provider_betslip_id,
            status,
            language
        ) VALUES (
            UNHEX(:betslipId),
            :tProviderId,
            UNHEX(:providerBetslipId),
            :status,
            :language
        );
    `;

    await conn.query<ResultSetHeader>(betslipQuery, {
      betslipId: betslip.id,
      tProviderId: betslip.tenantProviderId,
      providerBetslipId: betslip.providerBetslipId,
      status: betslip.status,
      language: betslip.language,
    });

    const betPromises: any[] = [];

    betslip.bets.forEach((bet) => {
      betPromises.push(
        conn.query(this.createBetQuery(), {
          betId: bet.id,
          betBetslipId: bet.betslipId,
          betProviderBetId: bet.providerBetId,
          betGameType: bet.gameType,
        })
      );
    });

    const resBet = await Promise.allSettled(betPromises);
    const error = resBet.find((r) => r.status === 'rejected');
    if (error && error.status === 'rejected') {
      throw error.reason as Error;
    }
    return betslip;
  }

  private createBetQuery(): string {
    return `
        INSERT INTO sharded.bet (
            id,
            betslip_id,
            provider_bet_id,
            game_type
        ) VALUES (
            UNHEX(:betId),
            UNHEX(:betBetslipId),
            UNHEX(:betProviderBetId),
            :betGameType
        );
        `;
  }

  async loadTenantProviderByName(
    provider: string,
    tenant: string,
    connection?: PoolConnection
  ): Promise<TenantProvider> {
    const work = async (conn: PoolConnection) => {
      try {
        const tenantProviderQuery = `
          SELECT
            tp.id,
            t.id AS tenantId,
            t.name AS tenantName,
            p.id AS providerId,
            p.name AS providerName
          FROM 
            unsharded.tenant_provider tp 
          JOIN 
            unsharded.provider p 
          ON 
            p.id = tp.provider_id 
          JOIN 
            unsharded.tenant t 
          ON
            t.id = tp.tenant_id 
          WHERE 
            t.name = :tenantName AND p.name = :providerName;
    `;

        const tProviderRes = (
          await conn.query(tenantProviderQuery, {
            tenantName: tenant,
            providerName: provider,
          })
        )[0];

        const res = {
            id: tProviderRes[0].id,
            tenant: {
              id: tProviderRes[0].tenantId,
              name: tProviderRes[0].tenantName,
            },
            provider: {
              id: tProviderRes[0].providerId,
              name: tProviderRes[0].providerName,
            },
          } as TenantProvider;
          
        return res
      } catch (e) {
        console.log(e);

        throw e;
      }
    };

    if (connection) {
      return await work(connection);
    }
    console.log("Running independent transaction");
    return await DBAdapter.startTransaction(undefined, this.pool, work);
  }
}
