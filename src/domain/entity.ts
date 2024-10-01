export type Betslip = {
    id: string;
    tenantProviderId?: string;
    providerBetslipId: string;
    status: string;
    language: string;
    bets: Bet[]
};

export type Bet = {
    id: string;
    betslipId: string;
    providerBetId: string;
    gameType: string;
}

export type TenantProvider = {
    id: string;
    tenant: {
        id: string;
        name: string,
    },
    provider: {
        id: string;
        name: string
    }
}