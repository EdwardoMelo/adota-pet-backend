-- Convert tenant address from free-text city to structured JSON.
ALTER TABLE `Tenant`
    ADD COLUMN `address` JSON NULL;

UPDATE `Tenant`
SET `address` = JSON_OBJECT(
    'street', COALESCE(`city`, ''),
    'city', '',
    'state', '',
    'zipCode', '',
    'number', '',
    'apartment', NULL
)
WHERE `address` IS NULL;

ALTER TABLE `Tenant`
    MODIFY `address` JSON NOT NULL;

ALTER TABLE `Tenant`
    DROP COLUMN `city`;

-- Convert shelter address from free-text to structured JSON.
ALTER TABLE `Shelter`
    ADD COLUMN `address_json` JSON NULL;

UPDATE `Shelter`
SET `address_json` = JSON_OBJECT(
    'street', COALESCE(`address`, ''),
    'city', '',
    'state', '',
    'zipCode', '',
    'number', '',
    'apartment', NULL
)
WHERE `address_json` IS NULL;

ALTER TABLE `Shelter`
    DROP COLUMN `address`;

ALTER TABLE `Shelter`
    CHANGE COLUMN `address_json` `address` JSON NOT NULL;
