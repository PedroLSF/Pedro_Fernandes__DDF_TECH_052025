import json
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('pt_BR')

# Temas do ENEM
enem_themes = [
    "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
    "Caminhos para combater a intolerância religiosa no Brasil",
    "A falta de empatia nas relações sociais no Brasil",
    "O estigma associado às doenças mentais na sociedade brasileira",
    "A importância da vacinação para a saúde pública",
    "A democratização do acesso ao cinema no Brasil",
    "Manipulação do comportamento do usuário pelo controle de dados na internet",
    "Desafios da educação de surdos no Brasil",
    "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
    "Publicidade infantil em questão no Brasil"
]

# Redações modelo por tema
sample_essays = {
    theme: f"O tema '{theme.lower()}' é de extrema importância na sociedade contemporânea. "
           f"É necessário refletir sobre seus impactos e propor soluções que envolvam tanto o Estado quanto a sociedade civil. "
           f"Ao abordar essa questão, é fundamental considerar aspectos históricos, sociais e culturais que agravam a situação. "
           f"Portanto, é urgente que sejam implementadas políticas públicas eficazes e ações educativas que promovam a conscientização da população."
    for theme in enem_themes
}

# Usuários fixos que você pediu
fixed_users = [
    {
        "id": "3b4165ce-c8b6-4ee7-aea2-facdf511a275",
        "name": "Sara Araújo",
        "email": "barbosahadassa@example.net",
        "password": "Xp4V3yY$B&",
        "phone": "+55 71 4152-6337",
        "biography": "Fugit aut dicta porro soluta tenetur molestiae. Commodi quaerat impedit a.\nEt sint maxime asperiores rerum.",
        "active": True,
        "is_master": False,
        "created_at": str(datetime.now()),
        "updated_at": None,
        "deleted_at": None
    },
    {
        "id": "3b4165ce-c8b6-4ee7-aea2-facdf511a275",
        "name": "Pedro Lucas",
        "email": "siqueira@example.net",
        "password": "Xpd5t",
        "phone": "+55 71 4152-6337",
        "biography": "Fugit aut dicta porro soluta tenetur molestiae. Commodi quaerat impedit a.\nEt sint maxime asperiores rerum.",
        "active": True,
        "is_master": True,
        "created_at": str(datetime.now()),
        "updated_at": None,
        "deleted_at": None
    }
]

# Criar 5 alunos aleatórios
students = []
for _ in range(5):
    students.append({
        "id": fake.uuid4(),
        "name": fake.name(),
        "email": fake.unique.email(),
        "password": fake.password(),
        "phone": fake.phone_number(),
        "biography": fake.text(max_nb_chars=200),
        "active": True,
        "is_master": False,
        "created_at": str(datetime.now()),
        "updated_at": None,
        "deleted_at": None
    })

# Lista final de usuários = fixos + aleatórios
users = fixed_users + students

# Gerar 100.000 redações com 'note' e 'status'
essays = []
for i in range(100_000):
    student = random.choice(users)  # pode ser fixo ou aleatório
    theme = random.choice(enem_themes)

    note = random.randint(0, 100) if random.random() < 1/3 else None
    status = "Reviewed" if note is not None else "Submitted"

    essay = {
        "id": fake.uuid4(),
        "title": f"Redação ENEM - {theme}",
        "text": sample_essays[theme],
        "theme": theme,
        "note": note,
        "status": status,
        "user_id": student["id"],
        "created_at": str(datetime.now() - timedelta(days=random.randint(0, 365))),
        "updated_at": None,
        "deleted_at": None
    }
    essays.append(essay)

# Estrutura final
output_data = {
    "users": users,
    "essays": essays
}

# Salvar arquivo JSON
output_path = "./redaplus_seed_data.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"✅ Arquivo JSON salvo em: {output_path}")
