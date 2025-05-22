import { PrismaClient } from '@prisma/client';
import { readJson } from 'fs-extra';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.resolve(__dirname, './redaplus_seed_data.json');
  const { users, essays } = await readJson(jsonPath);

  // Upsert usuários
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        biography: user.biography,
        active: user.active,
        is_master: user.is_master,
        created_at: new Date(user.created_at),
        updated_at: user.updated_at ? new Date(user.updated_at) : null,
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        biography: user.biography,
        active: user.active,
        is_master: user.is_master,
        created_at: new Date(user.created_at),
        updated_at: user.updated_at ? new Date(user.updated_at) : null,
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : null,
      },
    });
  }

  console.log('Usuários inseridos/atualizados');

  // Create redações
  for (const essay of essays) {
    await prisma.essay.create({
      data: {
        id: essay.id,
        title: essay.title,
        text: essay.text,
        theme: essay.theme,
        note: essay.note,
        status: essay.status,
        user_id: essay.user_id,
        created_at: new Date(essay.created_at),
        updated_at: essay.updated_at ? new Date(essay.updated_at) : null,
        deleted_at: essay.deleted_at ? new Date(essay.deleted_at) : null,
      },
    });
  }

  console.log('Redações inseridas/atualizadas');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
