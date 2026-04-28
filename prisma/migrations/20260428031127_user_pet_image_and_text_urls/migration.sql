-- AlterTable
ALTER TABLE `ShelterPet` MODIFY `imageUrl` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `UserPet` ADD COLUMN `imageUrl` TEXT NULL;
