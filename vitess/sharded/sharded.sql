
CREATE TABLE betslip (
    id BINARY(16) NOT NULL,
    tenant_provider_id VARCHAR(24) NOT NULL,
    provider_betslip_id BINARY(16) NOT NULL,
    `status` VARCHAR(24) NOT NULL,
    `language` VARCHAR(24) NOT NULL,
    PRIMARY KEY(id),
    INDEX ix_betslip_tenant_provider_id(tenant_provider_id),
    INDEX ix_betslip_provider_betslip_id(provider_betslip_id)
);

CREATE TABLE bet (
    id BINARY(16) NOT NULL,
    betslip_id BINARY(16) NOT NULL,
    provider_bet_id BINARY(16) NOT NULL,
    game_type VARCHAR(24) NOT NULL,
    PRIMARY KEY(id),
    INDEX ix_bet_betslip_id(betslip_id),
    INDEX ix_bet_provider_bet_id(provider_bet_id)
);
