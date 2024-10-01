
CREATE TABLE betslip_provider_betslip_id_keyspace_idx(
    provider_betslip_id VARBINARY(16),
    keyspace_id VARBINARY(16),
    PRIMARY KEY(provider_betslip_id)
);
CREATE TABLE bet_id_keyspace_idx(
    id VARBINARY(16), 
    keyspace_id VARBINARY(16),
    PRIMARY KEY(id)
);

CREATE TABLE bet_provider_bet_id_keyspace_idx(
    provider_bet_id VARBINARY(16),
    keyspace_id VARBINARY(16),
    PRIMARY KEY(provider_bet_id)
);


CREATE TABLE tenant (
    id BIGINT NOT NULL,
    `name` VARCHAR(255),
    PRIMARY KEY(id),
    INDEX ix_tenant_id(id),
    INDEX ix_tenant_name(`name`)
);

CREATE TABLE provider (
    id BIGINT NOT NULL,
    `name` VARCHAR(255),
    PRIMARY KEY(id),
    INDEX ix_provider_id(id),
    INDEX ix_provider_name(`name`)
);

CREATE TABLE tenant_provider (
    id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    PRIMARY KEY(id),
    INDEX ix_tenant_provider_id(id),
    INDEX ix_tenant_tenant_provider_id(tenant_id),
    INDEX ix_provider_tenant_provider_id(provider_id)
);



INSERT INTO tenant (id, name) VALUES (1, 'DEMO_TENANT_1'), (2, 'DEMO_TENANT_2');

INSERT INTO provider (id, name) VALUES (1, 'DEMO_PROVIDER_1'), (2, 'DEMO_PROVIDER_2');

INSERT INTO tenant_provider (id, provider_id, tenant_id) VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 2, 2);


