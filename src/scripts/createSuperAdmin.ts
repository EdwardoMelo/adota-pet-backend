import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

function readArg(flag: string): string | undefined {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const email = readArg('--email');
  const password = readArg('--password');

  if (!email || !password) {
    console.error(
      'Uso: npm run createSuperAdmin -- --email <email> --password <senha>',
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Super Admin',
        role: UserRole.super_admin,
        password: passwordHash,
        tenantId: null,
      },
      create: {
        name: 'Super Admin',
        email,
        role: UserRole.super_admin,
        password: passwordHash,
        tenantId: null,
      },
    });

    console.log(`Super admin criado/atualizado com sucesso: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
