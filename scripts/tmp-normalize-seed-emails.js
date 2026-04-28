const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    "UPDATE `User` SET email = 'ana.lima.cidada@adotapet.local' WHERE email = 'ana.lima.cidadã@adotapet.local'",
  );
  await prisma.$executeRawUnsafe(
    "UPDATE `User` SET email = 'bruno.ferreira.cidadao@adotapet.local' WHERE email = 'bruno.ferreira.cidadão@adotapet.local'",
  );
  await prisma.$executeRawUnsafe(
    "UPDATE `User` SET email = 'camila.duarte.cidada@adotapet.local' WHERE email = 'camila.duarte.cidadã@adotapet.local'",
  );
  await prisma.$executeRawUnsafe(
    "UPDATE `User` SET email = 'diego.martins.cidadao@adotapet.local' WHERE email = 'diego.martins.cidadão@adotapet.local'",
  );
  await prisma.$executeRawUnsafe(
    "UPDATE `User` SET email = 'fernanda.rocha.cidada@adotapet.local' WHERE email = 'fernanda.rocha.cidadã@adotapet.local'",
  );

  const citizens = await prisma.$queryRawUnsafe(
    "SELECT id, name, email FROM `User` WHERE role = 'citizen' ORDER BY id DESC LIMIT 5",
  );
  console.log(JSON.stringify(citizens, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
