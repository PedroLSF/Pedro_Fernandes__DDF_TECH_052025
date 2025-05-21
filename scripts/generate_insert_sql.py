import random
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

output_data = {
    "users": [reviewer] + students,
    "essays": essays
}

def sql_val(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, datetime):
        return f"'{value.strftime('%Y-%m-%d %H:%M:%S')}'"
    # Escapa aspas simples para SQL (duas aspas simples no lugar de uma)
    s = str(value).replace("'", "''")
    return f"'{s}'"

with open("seed_inserts.sql", "w", encoding="utf-8") as fsql:
    fsql.write("-- Inserts para tabela users\n")
    for u in output_data["users"]:
        cols = ["id", "name", "email", "password", "phone", "biography", "active", "is_master", "created_at", "updated_at", "deleted_at"]
        vals = [sql_val(u.get(c)) for c in cols]
        fsql.write(f"INSERT INTO users ({', '.join(cols)}) VALUES ({', '.join(vals)});\n")

    fsql.write("\n-- Inserts para tabela essays\n")
    for e in output_data["essays"]:
        cols = ["id", "title", "text", "theme", "status", "user_id", "created_at", "updated_at", "deleted_at"]
        vals = [sql_val(e.get(c)) for c in cols]
        fsql.write(f"INSERT INTO essays ({', '.join(cols)}) VALUES ({', '.join(vals)});\n")

print("Arquivo SQL gerado com sucesso!")
