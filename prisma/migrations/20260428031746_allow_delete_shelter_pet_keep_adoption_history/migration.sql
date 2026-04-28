-- DropForeignKey
ALTER TABLE `Adoption` DROP FOREIGN KEY `Adoption_petId_fkey`;

-- AlterTable
ALTER TABLE `Adoption` MODIFY `petId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Adoption` ADD CONSTRAINT `Adoption_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `ShelterPet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
