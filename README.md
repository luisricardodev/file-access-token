# Portal de Arquivos por Token

Aplicacao web em Node.js com Express para disponibilizar pastas e arquivos de clientes por meio de links com token.

## Recursos

- Navegacao de pastas via web com breadcrumb
- Download individual de arquivos
- Download da pasta atual em ZIP
- Validacao de token no backend
- Restricao por pasta autorizada
- Protecao contra path traversal e caminhos absolutos
- Logs basicos de acesso, download e tentativas invalidas
- Interface responsiva com EJS, HTML, CSS e JavaScript simples

## Estrutura

```text
.
|-- data/
|   `-- tokens.json
|-- logs/
|-- samples/
|   `-- storage/
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- public/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   `-- views/
|-- .env.example
|-- package.json
`-- README.md
```

## Instalacao

```bash
npm install
```

## Configuracao do .env

Crie um arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

Ou manualmente:

```env
APP_NAME=Portal de Arquivos
PORT=3000
STORAGE_ROOT=./samples/storage
TOKENS_FILE=./data/tokens.json
LOG_DIR=./logs
ENABLE_ZIP=true
```

### Variaveis

- `APP_NAME`: nome exibido na interface
- `PORT`: porta HTTP do servidor
- `STORAGE_ROOT`: pasta raiz onde ficam os arquivos dos clientes
- `TOKENS_FILE`: arquivo JSON com os tokens cadastrados
- `LOG_DIR`: pasta dos logs
- `ENABLE_ZIP`: habilita ou desabilita o download de pasta em ZIP

## Execucao

Modo desenvolvimento:

```bash
npm run dev
```

Modo producao:

```bash
npm start
```

Depois, abra no navegador:

- `http://localhost:3000/`
- `http://localhost:3000/acesso/cliente-a-demo`
- `http://localhost:3000/?token=cliente-b-demo`

## Como cadastrar tokens

Edite `data/tokens.json` e adicione um novo objeto ao array:

```json
{
  "token": "novo-token-seguro",
  "clientName": "Cliente Novo",
  "allowedPath": "cliente_novo",
  "expiresAt": "2026-12-31T23:59:59Z",
  "readOnly": true
}
```

### Campos

- `token`: valor secreto que sera enviado no link
- `clientName`: nome exibido na tela
- `allowedPath`: pasta relativa ao `STORAGE_ROOT`
- `expiresAt`: data ISO opcional. Use `null` para nao expirar
- `readOnly`: mantido para registro da permissao de leitura

## Como apontar para a pasta real de arquivos

Defina o `STORAGE_ROOT` para a pasta principal que contem as subpastas dos clientes.

Exemplo Linux:

```env
STORAGE_ROOT=/dados/clientes
```

Exemplo Windows:

```env
STORAGE_ROOT=C:/dados/clientes
```

Se o token tiver `"allowedPath": "cliente_a"`, o usuario podera acessar apenas:

- Linux: `/dados/clientes/cliente_a`
- Windows: `C:/dados/clientes/cliente_a`

## Seguranca

O projeto aplica as seguintes protecoes:

1. O token e validado no backend em toda rota de acesso.
2. O caminho final sempre e resolvido com `path.resolve`.
3. O caminho solicitado precisa continuar dentro da pasta autorizada.
4. O caminho real tambem e comparado com `fs.realpath` para bloquear escapes por links simbolicos.
5. Caminhos absolutos, `../`, `..\\` e tentativas de sair da raiz autorizada sao negados.
6. Arquivos ocultos iniciados com `.` nao sao listados.
7. A aplicacao nao possui rotas de upload, exclusao ou edicao.

## Logs

Os logs sao gravados em `logs/server.log` com registros de:

- acesso com token valido
- downloads realizados
- tentativas invalidas
- erros da aplicacao

## Publicacao em VPS Linux

1. Instale Node.js LTS no servidor.
2. Copie o projeto para uma pasta dedicada, por exemplo `/var/www/portal-arquivos`.
3. Rode `npm install`.
4. Configure o `.env` com a pasta real dos clientes.
5. Inicie com `npm start` ou use PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name portal-arquivos
pm2 save
```

6. Publique atras de um proxy reverso como Nginx:

```nginx
server {
    listen 80;
    server_name seusite.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Publicacao em Windows Server ou VPS Windows

1. Instale Node.js LTS.
2. Copie o projeto para uma pasta como `C:\apps\portal-arquivos`.
3. Rode `npm install`.
4. Configure o `.env`.
5. Inicie com `npm start`.
6. Para manter o servico ativo, use NSSM, PM2 ou o Agendador de Tarefas do Windows.
7. Se quiser expor na internet, coloque IIS, Nginx para Windows ou outro proxy na frente da aplicacao.

## Observacoes

- O projeto vem com amostras em `samples/storage` apenas para demonstracao.
- Os tokens de exemplo podem ser trocados imediatamente antes de uso real.
- Se quiser desabilitar ZIP, ajuste `ENABLE_ZIP=false`.
