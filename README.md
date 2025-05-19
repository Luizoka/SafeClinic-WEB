# SafeClinic

SafeClinic é um sistema fictício para agendamento de consultas médicas, desenvolvido como projeto acadêmico.

## Funcionalidades

- Login separado para Paciente, Médico e Recepcionista
- Autenticação via API REST
- Redirecionamento seguro conforme o tipo de usuário
- Armazenamento seguro de tokens JWT

## Tecnologias Utilizadas

- React 19
- React Router DOM
- TypeScript
- Axios

## Como rodar o projeto

1. **Clone o repositório**
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env`:
   ```
   REACT_APP_API_BASE_URL=http://localhost:3000
   PORT=3001
   ```
   > A API deve estar rodando em `localhost:3000` e o site em `localhost:3001`.

4. Inicie o projeto:
   ```bash
   npm start
   ```
5. Acesse [http://localhost:3001](http://localhost:3001) no navegador.

## Estrutura de Pastas

- `src/pages/` — Telas de login para cada tipo de usuário
- `src/services/` — Serviços de autenticação
- `public/` — Arquivos estáticos e `index.html`

## Autores

- Luiz Lopes (Luizoka)
- Sandra Remedios
