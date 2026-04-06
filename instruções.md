# Crie uma aplicação web em Node.js para disponibilizar pastas e arquivos de clientes por meio de links com token de acesso.

# Objetivo:
Quero hospedar uma aplicação local ou em servidor que leia uma pasta raiz no disco, liste subpastas e arquivos na web, permita navegação entre pastas, e faça download de arquivos. O acesso deve ser protegido por token único na URL ou por token validado no backend.

Stack desejada:
- Node.js
- Express
- HTML, CSS e JavaScript simples no frontend
- Pode usar EJS, mas prefira interface simples e limpa
- Sem complexidade desnecessária
- Código organizado em pastas
- Variáveis sensíveis em .env

Requisitos funcionais:
1. A aplicação deve ler uma pasta raiz configurável no .env, por exemplo:
   STORAGE_ROOT=/dados/clientes

2. A página deve mostrar:
   - lista de pastas
   - lista de arquivos
   - botão/link para entrar na pasta
   - botão para baixar arquivo
   - caminho atual em breadcrumb

3. O usuário deve acessar por um link com token, por exemplo:
   /acesso/:token
   ou
   /?token=ABC123

4. O token deve ser validado no backend.
   Quero uma estrutura simples onde eu possa cadastrar tokens manualmente em JSON, banco SQLite ou arquivo local.
   Cada token deve poder ter:
   - nome do cliente
   - pasta liberada
   - data de expiração opcional
   - permissão somente leitura

5. Cada token deve enxergar apenas a pasta permitida para ele.
   Exemplo:
   token X só pode acessar /dados/clientes/cliente_a
   token Y só pode acessar /dados/clientes/cliente_b

6. Impedir totalmente acesso fora da pasta permitida.
   Proteger contra path traversal como:
   ../
   ..\\
   caminhos absolutos
   qualquer tentativa de sair da raiz autorizada

7. Permitir download de arquivos individuais.

8. Se possível, incluir opção para baixar uma pasta compactada em ZIP.
   Se isso complicar muito, deixar preparado como melhoria futura.

9. Criar tela bonita, simples e profissional, responsiva, com:
   - nome do cliente
   - lista de arquivos
   - tamanho do arquivo
   - data de modificação
   - ícones simples para pasta e arquivo
   - botão de download

10. Criar tratamento de erros:
   - token inválido
   - token expirado
   - arquivo não encontrado
   - acesso negado

11. Criar logs básicos no servidor para:
   - acessos por token
   - downloads realizados
   - tentativas inválidas

12. Criar README com instruções de:
   - instalação
   - configuração do .env
   - execução
   - como cadastrar tokens
   - como mudar a pasta raiz

Requisitos técnicos:
- Código limpo e modular
- Separar rotas, controllers, services e middlewares
- Criar middleware de autenticação por token
- Criar service seguro para leitura de diretórios
- Criar helper para validar caminhos
- Usar fs/promises
- Não expor arquivos ocultos se possível
- Não permitir upload, exclusão ou edição, apenas leitura e download

Estrutura sugerida:
- src/
  - app.js
  - server.js
  - routes/
  - controllers/
  - services/
  - middlewares/
  - utils/
  - views/ ou public/
- data/tokens.json
- .env.example
- README.md

Exemplo de estrutura de tokens:
[
  {
    "token": "abc123xyz",
    "clientName": "Cliente A",
    "allowedPath": "cliente_a",
    "expiresAt": "2026-12-31T23:59:59Z"
  },
  {
    "token": "token_cliente_b",
    "clientName": "Cliente B",
    "allowedPath": "cliente_b",
    "expiresAt": null
  }
]

Rotas esperadas:
- GET /acesso/:token
- GET /acesso/:token/listar?path=subpasta
- GET /acesso/:token/download?file=arquivo.pdf

Importante:
- O backend deve sempre resolver caminhos com path.resolve
- Validar que o caminho final continua dentro da pasta autorizada do token
- Nunca confiar no path vindo da URL
- Sanitizar entradas
- Não usar soluções complexas demais

Quero o projeto completo funcionando, com todos os arquivos gerados, pronto para rodar com:
npm install
npm run dev

Também quero que você explique no final:
1. como funciona a segurança
2. como cadastrar um novo cliente/token
3. como apontar para minha pasta real de arquivos
4. como publicar em um VPS Linux ou Windows

Gere tudo já com código completo.