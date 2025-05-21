import random
import csv
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('pt_BR')

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

sample_essays = {
    theme: f"O tema '{theme.lower()}' é de extrema importância na sociedade contemporânea. "
           f"É necessário refletir sobre seus impactos e propor soluções que envolvam tanto o Estado quanto a sociedade civil. "
           f"Ao abordar essa questão, é fundamental considerar aspectos históricos, sociais e culturais que agravam a situação. "
           f"Portanto, é urgente que sejam implementadas políticas públicas eficazes e ações educativas que promovam a conscientização da população."
    for theme in enem_themes
}

now = datetime.now()

reviewer = {
    "id": fake.uuid4(),
    "name": fake.name(),
    "email": fake.unique.email(),
    "password": fake.password(),
    "phone": fake.phone_number(),
    "biography": "Sou corretor experiente com atuação na área de educação e correção de redações do ENEM.",
    "active": True,
    "is_master": True,
    "created_at": now,
    "updated_at": None,
    "deleted_at": None
}

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
        "created_at": now,
        "updated_at": None,
        "deleted_at": None
    })

essays = []
for _ in range(100_000):
    student = random.choice(students)
    theme = random.choice(enem_themes)
    essay = {
        "id": fake.uuid4(),
        "title": f"Redação ENEM - {theme}",
        "text": sample_essays[theme],
        "theme": theme,
        "user_id": student["id"],
        "status": random.choice(["Submitted", "Reviewed"]),
        "created_at": now - timedelta(days=random.randint(0, 365)),
        "updated_at": None,
        "deleted_at": None
    }
    essays.append(essay)

# Função para formatar datetime para string, ou vazio se None
def format_date(dt):
    return dt.strftime('%Y-%m-%d %H:%M:%S') if dt else ''

# Gerar CSV para users com aspas sempre
with open("users.csv", "w", newline='', encoding="utf-8") as f_users:
    writer = csv.writer(f_users, quoting=csv.QUOTE_ALL)
    header = ["id", "name", "email", "password", "phone", "biography", "active", "is_master", "created_at", "updated_at", "deleted_at"]
    writer.writerow(header)
    for u in [reviewer] + students:
        row = [
            u["id"],
            u["name"],
            u["email"],
            u["password"],
            u["phone"],
            u["biography"],
            int(u["active"]),
            int(u["is_master"]),
            format_date(u["created_at"]),
            format_date(u["updated_at"]),
            format_date(u["deleted_at"]),
        ]
        writer.writerow(row)

# Gerar CSV para essays com aspas sempre
with open("essays.csv", "w", newline='', encoding="utf-8") as f_essays:
    writer = csv.writer(f_essays, quoting=csv.QUOTE_ALL)
    header = ["id", "title", "text", "theme", "status", "user_id", "created_at", "updated_at", "deleted_at"]
    writer.writerow(header)
    for e in essays:
        row = [
            e["id"],
            e["title"],
            e["text"],
            e["theme"],
            e["status"],
            e["user_id"],
            format_date(e["created_at"]),
            format_date(e["updated_at"]),
            format_date(e["deleted_at"]),
        ]
        writer.writerow(row)

print("Arquivos CSV gerados com sucesso!")
