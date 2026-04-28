const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const EXISTING_MAIN_TENANT_ID = 6;

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

async function q(sql) {
  return prisma.$queryRawUnsafe(sql);
}

async function e(sql) {
  return prisma.$executeRawUnsafe(sql);
}

async function ensureTenant(tenant) {
  const rows = await q(
    `SELECT id FROM \`Tenant\` WHERE name = ${sqlValue(tenant.name)} ORDER BY id LIMIT 1`,
  );
  if (rows.length > 0) return rows[0].id;

  await e(
    `INSERT INTO \`Tenant\` (name, city, subscriptionStatus, createdAt, updatedAt)
     VALUES (${sqlValue(tenant.name)}, ${sqlValue(tenant.city)}, 'trialing', NOW(), NOW())`,
  );
  const created = await q(
    `SELECT id FROM \`Tenant\` WHERE name = ${sqlValue(tenant.name)} ORDER BY id DESC LIMIT 1`,
  );
  return created[0].id;
}

async function ensureShelter(shelter) {
  const rows = await q(
    `SELECT id FROM \`Shelter\` WHERE tenantId = ${sqlValue(shelter.tenantId)} AND email = ${sqlValue(shelter.email)} ORDER BY id LIMIT 1`,
  );
  if (rows.length > 0) return rows[0].id;

  await e(
    `INSERT INTO \`Shelter\` (name, cnpj, contact, address, email, tenantId, createdAt, updatedAt)
     VALUES (
       ${sqlValue(shelter.name)},
       ${sqlValue(shelter.cnpj)},
       ${sqlValue(shelter.contact)},
       ${sqlValue(shelter.address)},
       ${sqlValue(shelter.email)},
       ${sqlValue(shelter.tenantId)},
       NOW(),
       NOW()
     )`,
  );
  const created = await q(
    `SELECT id FROM \`Shelter\` WHERE tenantId = ${sqlValue(shelter.tenantId)} AND email = ${sqlValue(shelter.email)} ORDER BY id DESC LIMIT 1`,
  );
  return created[0].id;
}

async function ensureUser(user, plainPassword, credentialsLog) {
  const rows = await q(`SELECT id FROM \`User\` WHERE email = ${sqlValue(user.email)} LIMIT 1`);
  if (rows.length > 0) {
    credentialsLog.push({ email: user.email, password: plainPassword, role: user.role, existing: true });
    return rows[0].id;
  }

  const hash = await bcrypt.hash(plainPassword, 10);
  await e(
    `INSERT INTO \`User\` (name, email, password, role, tenantId, stripeCustomerId, stripeSubscriptionId, createdAt, updatedAt)
     VALUES (
       ${sqlValue(user.name)},
       ${sqlValue(user.email)},
       ${sqlValue(hash)},
       ${sqlValue(user.role)},
       ${sqlValue(user.tenantId)},
       NULL,
       NULL,
       NOW(),
       NOW()
     )`,
  );
  const created = await q(`SELECT id FROM \`User\` WHERE email = ${sqlValue(user.email)} LIMIT 1`);
  credentialsLog.push({ email: user.email, password: plainPassword, role: user.role, existing: false });
  return created[0].id;
}

async function ensureProcedures(tenantId, procedures) {
  for (const p of procedures) {
    const rows = await q(
      `SELECT id FROM \`Procedure\` WHERE tenantId = ${sqlValue(tenantId)} AND name = ${sqlValue(p.name)} LIMIT 1`,
    );
    if (rows.length > 0) continue;

    await e(
      `INSERT INTO \`Procedure\` (tenantId, name, description, durationMinutes, isActive, createdAt, updatedAt)
       VALUES (
         ${sqlValue(tenantId)},
         ${sqlValue(p.name)},
         ${sqlValue(p.description)},
         ${sqlValue(p.durationMinutes)},
         1,
         NOW(),
         NOW()
       )`,
    );
  }
}

async function ensurePets(tenantId, pets) {
  for (const p of pets) {
    const rows = await q(
      `SELECT id FROM \`ShelterPet\` WHERE tenantId = ${sqlValue(tenantId)} AND name = ${sqlValue(p.name)} LIMIT 1`,
    );
    if (rows.length > 0) continue;

    await e(
      `INSERT INTO \`ShelterPet\` (tenantId, name, age, species, description, status, imageUrl, createdAt, updatedAt)
       VALUES (
         ${sqlValue(tenantId)},
         ${sqlValue(p.name)},
         ${sqlValue(p.age)},
         ${sqlValue(p.species)},
         ${sqlValue(p.description)},
         'available',
         ${sqlValue(p.imageUrl)},
         NOW(),
         NOW()
       )`,
    );
  }
}

async function createAppointmentsForTenant(tenantId, total, citizenIds) {
  const procedures = await q(
    `SELECT id FROM \`Procedure\` WHERE tenantId = ${sqlValue(tenantId)} AND isActive = 1 ORDER BY id`,
  );
  if (!procedures.length || !citizenIds.length) return;

  for (let i = 0; i < total; i += 1) {
    const userId = citizenIds[i % citizenIds.length];
    const procedureId = procedures[i % procedures.length].id;
    const dayOffset = i + 1;
    await e(
      `INSERT INTO \`Appointment\` (tenantId, userId, procedureId, userPetId, scheduledAt, status, notes, createdAt, updatedAt)
       VALUES (
         ${sqlValue(tenantId)},
         ${sqlValue(userId)},
         ${sqlValue(procedureId)},
         NULL,
         DATE_ADD(NOW(), INTERVAL ${sqlValue(dayOffset)} DAY),
         'scheduled',
         ${sqlValue("Estamos te esperando para cuidar com muito carinho!")},
         NOW(),
         NOW()
       )`,
    );
  }
}

async function createPendingAdoptions(tenantId, total, citizenIds) {
  const pets = await q(
    `SELECT id FROM \`ShelterPet\` WHERE tenantId = ${sqlValue(tenantId)} ORDER BY id DESC LIMIT ${sqlValue(total)}`,
  );
  if (!pets.length || !citizenIds.length) return;

  for (let i = 0; i < Math.min(total, pets.length); i += 1) {
    const userId = citizenIds[i % citizenIds.length];
    await e(
      `INSERT INTO \`Adoption\` (tenantId, petId, userId, status, notes, createdAt, updatedAt)
       VALUES (
         ${sqlValue(tenantId)},
         ${sqlValue(pets[i].id)},
         ${sqlValue(userId)},
         'pending',
         ${sqlValue("Família interessada e em contato ativo com o abrigo.")},
         NOW(),
         NOW()
       )`,
    );
  }
}

function proceduresTemplate() {
  return [
    { name: "Consulta clínica inicial", durationMinutes: 40, description: "Primeiro encontro acolhedor para entender o histórico do pet e montar um plano de cuidado sob medida." },
    { name: "Vacinação completa", durationMinutes: 30, description: "Proteção em dia para que seu amigo tenha mais saúde e energia para brincar com segurança." },
    { name: "Vermifugação preventiva", durationMinutes: 25, description: "Cuidado essencial para manter o organismo protegido e o bem-estar em alta todos os dias." },
    { name: "Microchipagem e cadastro", durationMinutes: 20, description: "Mais segurança para o pet e tranquilidade para a família em qualquer passeio." },
    { name: "Avaliação odontológica", durationMinutes: 35, description: "Sorrisos saudáveis também são para pets: prevenção de dor e melhora na qualidade de vida." },
    { name: "Sessão de banho terapêutico", durationMinutes: 50, description: "Higiene com conforto, produtos suaves e atenção especial para pele sensível." },
    { name: "Check-up geriátrico", durationMinutes: 45, description: "Um olhar carinhoso para pets maduros, com foco em longevidade e conforto." },
    { name: "Orientação comportamental", durationMinutes: 45, description: "Dicas práticas e afetivas para fortalecer vínculo, rotina e convivência em casa." },
  ];
}

function petsTemplate(cityTag) {
  return [
    {
      name: `Luna ${cityTag}`,
      age: 1,
      species: "dog",
      imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1200&auto=format&fit=crop&q=80",
      description: "Luna e um raio de alegria: brincalhona, carinhosa e sempre pronta para transformar qualquer dia comum em momento especial.",
    },
    {
      name: `Tom ${cityTag}`,
      age: 3,
      species: "cat",
      imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&auto=format&fit=crop&q=80",
      description: "Tom conquista no olhar: curioso, elegante e dono de um ronronado que acalma o coracao da casa inteira.",
    },
    {
      name: `Mel ${cityTag}`,
      age: 5,
      species: "dog",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80",
      description: "Mel e doce como o nome: extremamente fiel, adora colo e tem uma energia tranquila perfeita para familias amorosas.",
    },
    {
      name: `Nino ${cityTag}`,
      age: 7,
      species: "other",
      imageUrl: "https://images.unsplash.com/photo-1501706362039-c6e13b5dbf59?w=1200&auto=format&fit=crop&q=80",
      description: "Nino e um companheiro sensivel e inteligente, daqueles que parecem entender exatamente quando voce precisa de afeto.",
    },
    {
      name: `Amora ${cityTag}`,
      age: 9,
      species: "cat",
      imageUrl: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=1200&auto=format&fit=crop&q=80",
      description: "Amora e pura delicadeza: serena, observadora e perfeita para quem busca uma amizade profunda e cheia de ternura.",
    },
  ];
}

async function main() {
  const credentialsLog = [];

  const sheltersData = [
    {
      tenant: { name: "Canil Esperanca Paulista", city: "Campinas, SP" },
      shelter: {
        name: "Canil Esperanca Paulista",
        cnpj: "45.321.987/0001-10",
        contact: "(19) 99876-1122",
        address: "Rua Barreto Leme, 845 - Centro, Campinas - SP",
        email: "contato@canilesperancapaulista.org",
      },
      admin: { name: "Marina Alves", email: "admin.campinas@adotapet.local", password: "Campinas@2026" },
      cityTag: "Campinas",
    },
    {
      tenant: { name: "Lar Patinhas da Serra", city: "Caxias do Sul, RS" },
      shelter: {
        name: "Lar Patinhas da Serra",
        cnpj: "12.654.380/0001-44",
        contact: "(54) 99123-7788",
        address: "Avenida Italia, 2140 - Sao Pelegrino, Caxias do Sul - RS",
        email: "contato@patinhasdaserra.org",
      },
      admin: { name: "Rafael Nunes", email: "admin.caxias@adotapet.local", password: "Caxias@2026" },
      cityTag: "Caxias",
    },
    {
      tenant: { name: "Casa do Focinho Feliz", city: "Curitiba, PR" },
      shelter: {
        name: "Casa do Focinho Feliz",
        cnpj: "77.219.500/0001-62",
        contact: "(41) 99771-4433",
        address: "Rua Itupava, 1299 - Alto da XV, Curitiba - PR",
        email: "contato@focinhofeliz.org",
      },
      admin: { name: "Paula Rezende", email: "admin.curitiba@adotapet.local", password: "Curitiba@2026" },
      cityTag: "Curitiba",
    },
  ];

  const citizenSeeds = [
    { name: "Ana Carolina Lima", email: "ana.lima.cidadã@adotapet.local", password: "Cidadao@2026" },
    { name: "Bruno Ferreira", email: "bruno.ferreira.cidadão@adotapet.local", password: "Cidadao@2026" },
    { name: "Camila Duarte", email: "camila.duarte.cidadã@adotapet.local", password: "Cidadao@2026" },
    { name: "Diego Martins", email: "diego.martins.cidadão@adotapet.local", password: "Cidadao@2026" },
    { name: "Fernanda Rocha", email: "fernanda.rocha.cidadã@adotapet.local", password: "Cidadao@2026" },
  ];

  const tenantIds = [EXISTING_MAIN_TENANT_ID];

  for (const shelterPack of sheltersData) {
    const tenantId = await ensureTenant(shelterPack.tenant);
    tenantIds.push(tenantId);

    await ensureShelter({
      ...shelterPack.shelter,
      tenantId,
    });

    await ensureUser(
      {
        name: shelterPack.admin.name,
        email: shelterPack.admin.email,
        role: "shelter_admin",
        tenantId,
      },
      shelterPack.admin.password,
      credentialsLog,
    );

    await ensureProcedures(tenantId, proceduresTemplate());
    await ensurePets(tenantId, petsTemplate(shelterPack.cityTag));
  }

  // Enriquecer abrigo principal existente (Eduardo) com procedimentos e pets.
  await ensureProcedures(EXISTING_MAIN_TENANT_ID, proceduresTemplate());
  await ensurePets(EXISTING_MAIN_TENANT_ID, petsTemplate("Eduardo"));

  const citizenIds = [];
  for (const citizen of citizenSeeds) {
    const userId = await ensureUser(
      {
        name: citizen.name,
        email: citizen.email,
        role: "citizen",
        tenantId: null,
      },
      citizen.password,
      credentialsLog,
    );
    citizenIds.push(userId);
  }

  // 5 agendamentos para cada novo abrigo.
  for (const tenantId of tenantIds.filter((id) => id !== EXISTING_MAIN_TENANT_ID)) {
    await createAppointmentsForTenant(tenantId, 5, citizenIds);
  }

  // 10 agendamentos no abrigo principal já existente.
  await createAppointmentsForTenant(EXISTING_MAIN_TENANT_ID, 10, citizenIds);

  // 5 adoções pendentes para o abrigo principal.
  await createPendingAdoptions(EXISTING_MAIN_TENANT_ID, 5, citizenIds);

  console.log("DONE");
  console.log(JSON.stringify({ credentialsLog, tenantIds }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
