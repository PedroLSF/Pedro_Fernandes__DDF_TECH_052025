# Pedro_Fernandes__DDF_TECH_052025 - RedaPlus

## Sumário:
1. [Apresentações](#apresentações)
2. [Projeto](#projeto)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Testes](#testes)
5. [Capturas de Tela - Uso da Aplicação](#capturas-de-tela---uso-da-aplicação)

## Apresentações

1. Apresentação mais curta e em Português:
* [Apresentação](https://youtu.be/hfNUDU638aQ)

2. Apresentação mais lenta e com calma. Em Inglês:
* [Apresentação](https://youtu.be/xkVVEZBFetg)

## Projeto

RedaPlus é um software que conecta professores e alunos, onde alunos podem enviar redações para serem corrigidas e utilizar AI para planejar a escrita de novas redações.

Foi desenvolvida com as seguintes tecnologias:
* **Backend:** Foi Utilizado Nest (NodeJS) devido a capacidade de injeção de dependências muito forte, modularização.

* **Frontend:** Desenvolvido com Next.js (React) e a biblioteca Minimals (baseada em MUI). Conforme descrito na seção de gestão de riscos (link), a escolha dessa biblioteca se baseou na sua ampla gama de componentes e funcionalidades, o que, mesmo que nem todos fossem utilizados, proporcionou maior produtividade e contribuiu para o cumprimento do prazo.

## Configuração do Ambiente

### Backend

1. Acesse a pasta do Backend:

```bash
cd Backend
```

2. Crie o arquivo .env a partir do .env.example (Mantenha todos os ENV em `/Backend`)

3. Instale as dependências com:
``` bash
npm install
```

Após esses dois passos serem realizados com sucesso, você deverá ter um retorno parecido com esse:

![Back-Step1an1d2](/assets/Back-InstallDependencies.png)
*Passos 1, 2 e 3 realizados com sucesso*

Depois disso, podemos subir o container do backend, que é composto pelo:
* Backend;
* MySQL;
* N8N.

4. Sub os containers:
```bash
docker compose up
```

Após isso, você deverá ver algo como isso (Em caso de sucesso):

![Back-Step3](/assets/Back/Back-DockerUp.png)
*Passo 3 realizado com sucesso*

***Obs:** Idealmente, o comando já irá buildar e subir a aplicação, mas caso contrário, é necessário buildar previamente.*

5. Configurar N8N:
Acesse o seu N8N local, que você subiu no passo 3, como demonstrado na imagem logo acima, o meu está em `http://localhost:5678`.

    5.1. Para essa etapa, você verá a seguinte tela:
    ![Back-N8N](/assets/Back/Back-N8N-tela-inicial-preenchida.png)

    Nessa etapa, pode utilizar seus dados ou até mesmo dados fakes, acredito que vá funcionar

    5.2 Clique em Get started e depois em skip:
    ![Back-N8N-get-start](/assets/Back/Back-N8N-GetStarted.png)

    ![Back-N8N-skip](/assets/Back-N8N-tela-skip.png)

    5.3 Abra o Workflow "My Workflow":
    ![Back-N8N-my-workflow](/assets/Back/Back-N8N-MyWorkflow.png)

    ***Obs:** Esse Workflow é importado de /Backend/n8n/exported-workflows.json*

    5.4 Vamos inserir a API Key da OpenAI no modelo que sera enviada para ele, que será enviada para ele.

    ![Back-N8N-workflow](/assets/Back/Back-N8N-Workflow.png)

    Você verá essa tela:
    ![Back-N8N-OpenAI-Node](/assets/Back/Back-N8N-OpenAI-Node.png)

    clique em `Select Credentials` ou se ja tiver configurado uma credential, clique no lápis que irá aparecer ao lado de `Select Credentials`.

    5.5 Após clicar em Select Credentials, a seguinte tela irá abrir, clique em expression:
    ![Back-N8N-InsertKey](/assets/Back/Back-N8N-Insert-Key.png)

    5.6 Insira agora na API Key, o seguinte dado:
    `{{$('Dados').item.json.key.replace(/^'+|'+$/g, '')}}` a key será enviada de forma automática e será obtidao do nó "Dados".

    5.7 Salve a sua alteração e feche esse nó:
    ![Back-N8N-Save-AI](/assets/Back/Back-N8N-Save-OpenAi.png)

    5.8 Agora Salve o Fluxo inteiro e ative o fluxo:
    ![Back-N8N-Save-Active](/assets/Back/Back-N8N-SaveAndActive.png)

Com isso finalizamos a configuração do Backend e do N8N.

*Obs: A justificativa da escolha do N8N se encontra nos documentos da gestão de Risco (link).*

Agora vamos popular o banco, temos duas possibilidades:

* Utilizar o arquivo de Seed;
* Utilizar o backup (link).

Nesse tutorial vamos utilizar a seed, mas sinta-se a vontade para escolher o que melhor se encaixa para você.

6. Para isso vamos utilizar o `redaplus_seed_data.json` que deve estar presente em `/Backend/prisma/seed`.
    
    6.1 Vamos abrir um novo terminal e acessar o container, com um comando como esse:
    ```bash
    docker exec -it backend_redaplus bash
    ```

    6.2 Dentro do container, vamos executar
    ```bash
    npx ts-node ./prisma/seed/population.ts 
    ```

    Esse comando pode demorar um pouco, mas ao final do processo, você verá essa tela em caso de sucesso:
    (IMAGEM)

Finalmente temos Backend + N8N configurados e Banco populado.

### Frontend

1. Acesse a pasta do Frontend:

```bash
cd Frontend/redaplus
```

2. Crie o arquivo .env a partir do .env.example (Mantenha todos os ENV em `/Frontend/redaplus`)

3. Instale as dependências com:
```bash
npm install
```

Você verá uma resposta parecida com essa ao final dos passos:
![Front-Dependencies](/assets/Front/Front-InstallDependencies.png)
*Passo 1, 2 e 3 realizados com sucesso*

4. Temos agora 2 opções:

* Iniciar em modo Dev: `yarn dev`
* Iniciar com build: `yarn build && yarn start`

Novamente, fica aberto a escolha, mas vamos buildar e iniciar após o build, até mesmo para auxiliar nos testes de integração.

Pode demorar um pouco, caso apareça retry ou alguma mensagem, fique tranquilo!

Após finalizar o processo, vamos ter essa mensagem no terminal:
![Front-Build](/assets/Front/Front-BuildAndStart.png)

Pronto! Frontend Configurado, podemos iniciar o uso do RedaPlus.

## Testes

### Backend

Para rodar os testes unitários no backend, siga os seguintes passos:

1. Acesse o Backend:
```bash
cd Backend
```
2. Execute `yarn test`

Você terá esse retorno no terminal:

![Back-TEST](/assets/Back/Back-UnitTest.png)

### Frontend

Para rodar os testes de integração demonstrados no Frontend, suba o backend e o frontend como demonstrado nos passos anteriores e siga os seguintes passos:

1. Acesse o Frontend:
```bash
cd Frontend/redaplus
```
2. Execute `npx cypress run`

Você terá esse retorno no terminal:
![Front-TEST](/assets/Front/Front-TestCy.png)


***Caso esteja com problemas ou queira ver no modo iterativo, também é possível acessar o modo interativo através de npx cypress open***

## Capturas de Tela - Uso da Aplicação

1. Tela de Login
![TelaLogin](/assets/AplicationPrints/TelaDeLogin.png)

2. Tela Inicial - Visão do Estudante:
![TelaInicialStudent](/assets/AplicationPrints/TelaInicialStudent.png)

3. Gráficos da Tela de Dashboard - Volume de dados do Estudante:
![Dash1](/assets/AplicationPrints/TelaDash1Student.png)
![Dash2](/assets/AplicationPrints/TelaDash2Student.png)

4. Tela de Planejamento:

    4.1 Antes de solicitar planejamento:
    ![PlanningBefore](/assets/AplicationPrints/PlanningBefore.png)

    4.2 Depois de solicitar planejamento:
    ![PlanningAfter](/assets/AplicationPrints/PlanningAfter.png)


5. Tela de visualizar redações + filtros:
![ViewRedacao](/assets/AplicationPrints/ViewEssays.png)

6. Tela de criar redações:
![CreateRedacao](/assets/AplicationPrints/CreateRedacao.png)

7. Tela de Editar/Visualizar redação corrigida - Visão do Estudante:
![EditOrViewRedacao](/assets/AplicationPrints/EditRedaçãoReviewedStudent.png)

8. Tela de Editar/Visualizar redação submetida - Visão do Estudante:
![EditOrViewRedacaoSub](/assets/AplicationPrints/EditRedaçãoSubmittedStudent.png)

9. Tela de Usuários - Visão do Corretor:
![ViewUser](/assets/AplicationPrints/ViewUser.png)

10. Modal de detalhes do Usuários - Visão do Corretor:
![ViewUser](/assets/AplicationPrints/ModelDetails.png)

11. Tela de criar Usuários - Visão do Corretor:
![CreateUser](/assets/AplicationPrints/CreateUser.png)

12. Tela de Editar Usuário - Visão do Corretor:
![EditUser](/assets/AplicationPrints/EditUser.png)

13. Gráficos da Tela de Dashboard - Volume de dados de todos usuários:
![Dash1](/assets/AplicationPrints/Dash1Admin.png)
![Dash2](/assets/AplicationPrints/Dash2Admin.png)

14. Tela de Opções:
![Options](/assets/AplicationPrints/options.png)