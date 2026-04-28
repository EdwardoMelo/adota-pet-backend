const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name",
  );
  console.log("TABLES");
  for (const row of tables) {
    console.log(row.table_name);
  }

  const eduardo = await prisma.$queryRawUnsafe(
    "SELECT id, name, email, role, tenantId FROM User WHERE name LIKE '%Eduardo%' OR email LIKE '%eduardo%' ORDER BY id",
  );
  console.log("\nEDUARDO USERS");
  console.log(JSON.stringify(eduardo, null, 2));

  const tenants = await prisma.$queryRawUnsafe(
    "SELECT id, name, city, subscriptionStatus FROM Tenant ORDER BY id",
  );
  console.log("\nTENANTS");
  console.log(JSON.stringify(tenants, null, 2));

  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      t.id,
      t.name,
      (SELECT COUNT(*) FROM \`Shelter\` s WHERE s.tenantId = t.id) AS shelters,
      (SELECT COUNT(*) FROM \`User\` u WHERE u.tenantId = t.id AND u.role = 'shelter_admin') AS shelterAdmins,
      (SELECT COUNT(*) FROM \`ShelterPet\` p WHERE p.tenantId = t.id) AS pets,
      (SELECT COUNT(*) FROM \`Procedure\` pr WHERE pr.tenantId = t.id) AS procedures,
      (SELECT COUNT(*) FROM \`Appointment\` a WHERE a.tenantId = t.id) AS appointments,
      (SELECT COUNT(*) FROM \`Adoption\` ad WHERE ad.tenantId = t.id AND ad.status = 'pending') AS pendingAdoptions
    FROM \`Tenant\` t
    ORDER BY t.id
  `);
  console.log("\nTENANT STATS");
  const normalizedStats = stats.map((row) => ({
    ...row,
    shelters: Number(row.shelters),
    shelterAdmins: Number(row.shelterAdmins),
    pets: Number(row.pets),
    procedures: Number(row.procedures),
    appointments: Number(row.appointments),
    pendingAdoptions: Number(row.pendingAdoptions),
  }));
  console.log(JSON.stringify(normalizedStats, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
