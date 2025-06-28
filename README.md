-----

# Documentação da API de Gerenciamento de Hotel

Esta documentação descreve os endpoints da API de Gerenciamento de Hotel, que permite a realização de operações CRUD (Create, Read, Update, Delete) em **Quartos**, **Hóspedes** e **Reservas**, além de funcionalidades de **Check-in** e **Check-out**.

-----

## 1\. Visão Geral

A API foi desenvolvida em Node.js com o framework Express e utiliza SQLite como banco de dados local através do ORM Sequelize. Ela simula um sistema básico de gestão de um hotel, permitindo controlar a disponibilidade dos quartos com base nas reservas e nas operações de check-in/out.

### 1.1 Base URL

`http://localhost:3000/api`

-----

## 2\. Modelos de Dados

### 2.1 Quarto

Representa um quarto no hotel.

| Campo         | Tipo                     | Descrição                                 | Restrições                          | Exemplo              |
| :------------ | :----------------------- | :---------------------------------------- | :---------------------------------- | :------------------- |
| `id`          | `Long`                   | Identificador único do quarto.            | Auto-incremento, Chave Primária     | `1`                  |
| `numero`      | `String`                 | Número ou identificação do quarto.        | **Obrigatório**, Único              | `"101"`, `"205A"`    |
| `tipo`        | `Enum` (`String`)        | Tipo de quarto.                           | **Obrigatório** (`SIMPLES`, `DUPLO`, `SUITE`) | `"SIMPLES"`          |
| `status`      | `Enum` (`String`)        | Disponibilidade atual do quarto.          | **Obrigatório** (`DISPONIVEL`, `OCUPADO`, `MANUTENCAO`) | `"DISPONIVEL"`       |
| `precoDiaria` | `Double`                 | Preço da diária do quarto.                | **Obrigatório** | `150.00`             |

### 2.2 Hóspede

Representa um hóspede do hotel.

| Campo      | Tipo     | Descrição                               | Restrições                                | Exemplo              |
| :--------- | :------- | :-------------------------------------- | :---------------------------------------- | :------------------- |
| `id`       | `Long`   | Identificador único do hóspede.         | Auto-incremento, Chave Primária           | `1`                  |
| `nome`     | `String` | Nome completo do hóspede.               | **Obrigatório** | `"João da Silva"`    |
| `documento` | `String` | Número do documento do hóspede (RG, CPF, Passaporte). | **Obrigatório**, Único                    | `"123.456.789-00"`   |
| `telefone` | `String` | Número de telefone do hóspede.          | **Obrigatório** | `"11999998888"`      |
| `email`    | `String` | Endereço de e-mail do hóspede.          | **Obrigatório**, Único, Formato de e-mail | `"joao@example.com"` |

### 2.3 Reserva

Representa uma reserva de um quarto para um hóspede.

| Campo         | Tipo                         | Descrição                                 | Restrições                               | Exemplo              |
| :------------ | :--------------------------- | :---------------------------------------- | :--------------------------------------- | :------------------- |
| `id`          | `Long`                       | Identificador único da reserva.           | Auto-incremento, Chave Primária          | `1`                  |
| `dataEntrada` | `Date` (formato `YYYY-MM-DD`) | Data de início da reserva.                | **Obrigatório** | `"2025-07-01"`       |
| `dataSaida`   | `Date` (formato `YYYY-MM-DD`) | Data de término da reserva.               | **Obrigatório**, Maior que `dataEntrada` | `"2025-07-05"`       |
| `quarto`      | `Quarto` (objeto aninhado)   | Objeto do quarto reservado (contém `id`, `numero`, `tipo`, `status`). | **Obrigatório** | Ver Exemplo          |
| `hospede`     | `Hospede` (objeto aninhado)  | Objeto do hóspede da reserva (contém `id`, `nome`, `documento`). | **Obrigatório** | Ver Exemplo          |
| `status`      | `Enum` (`String`)            | Status atual da reserva.                  | **Obrigatório** (`ATIVA`, `CANCELADA`, `CONCLUIDA`) | `"ATIVA"`            |

**Exemplo de Objeto de Reserva Retornado:**

```json
{
  "id": 1,
  "dataEntrada": "2025-07-01",
  "dataSaida": "2025-07-05",
  "quartoId": 1,
  "hospedeId": 1,
  "status": "ATIVA",
  "Quarto": {
    "id": 1,
    "numero": "101",
    "tipo": "SIMPLES",
    "status": "OCUPADO"
  },
  "Hospede": {
    "id": 1,
    "nome": "João da Silva",
    "documento": "123.456.789-00"
  }
}
```

-----

## 3\. Endpoints da API

### 3.1 Quartos

#### `GET /quartos` - Listar todos os Quartos

  * **Descrição**: Retorna uma lista de todos os quartos cadastrados.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    [
      {
        "id": 1,
        "numero": "101",
        "tipo": "SIMPLES",
        "status": "DISPONIVEL",
        "precoDiaria": 150.00
      }
    ]
    ```
  * **Resposta de Erro**: `500 Internal Server Error`

#### `GET /quartos/:id` - Obter Quarto por ID

  * **Descrição**: Retorna os detalhes de um quarto específico.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do quarto.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "id": 1,
      "numero": "101",
      "tipo": "SIMPLES",
      "status": "DISPONIVEL",
      "precoDiaria": 150.00
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Quarto não encontrado.
      * `500 Internal Server Error`

#### `POST /quartos` - Criar um Novo Quarto

  * **Descrição**: Cria um novo quarto no sistema.
  * **Corpo da Requisição**: `application/json`
    ```json
    {
      "numero": "102",
      "tipo": "DUPLO",
      "precoDiaria": 250.00
      // "status" pode ser omitido, padrão é "DISPONIVEL"
    }
    ```
  * **Resposta de Sucesso**: `201 Created`
    ```json
    {
      "id": 2,
      "numero": "102",
      "tipo": "DUPLO",
      "status": "DISPONIVEL",
      "precoDiaria": 250.00
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Dados inválidos ou quarto com número já existente.
      * `500 Internal Server Error`

#### `PUT /quartos/:id` - Atualizar um Quarto

  * **Descrição**: Atualiza as informações de um quarto existente.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do quarto a ser atualizado.
  * **Corpo da Requisição**: `application/json` (Envie apenas os campos que deseja atualizar)
    ```json
    {
      "status": "MANUTENCAO",
      "precoDiaria": 260.00
    }
    ```
  * **Resposta de Sucesso**: `200 OK` (Retorna o quarto atualizado)
    ```json
    {
      "id": 1,
      "numero": "101",
      "tipo": "SIMPLES",
      "status": "MANUTENCAO",
      "precoDiaria": 260.00
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Dados inválidos.
      * `404 Not Found`: Quarto não encontrado.
      * `500 Internal Server Error`

#### `DELETE /quartos/:id` - Deletar um Quarto

  * **Descrição**: Remove um quarto do sistema.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do quarto a ser deletado.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "message": "Quarto deletado com sucesso"
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Quarto não encontrado.
      * `500 Internal Server Error`: Erro ao tentar deletar (ex: quarto pode ter reservas associadas).

### 3.2 Hóspedes

#### `GET /hospedes` - Listar todos os Hóspedes

  * **Descrição**: Retorna uma lista de todos os hóspedes cadastrados.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    [
      {
        "id": 1,
        "nome": "João da Silva",
        "documento": "123.456.789-00",
        "telefone": "11999998888",
        "email": "joao@example.com"
      }
    ]
    ```
  * **Resposta de Erro**: `500 Internal Server Error`

#### `GET /hospedes/:id` - Obter Hóspede por ID

  * **Descrição**: Retorna os detalhes de um hóspede específico.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do hóspede.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "id": 1,
      "nome": "João da Silva",
      "documento": "123.456.789-00",
      "telefone": "11999998888",
      "email": "joao@example.com"
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Hóspede não encontrado.
      * `500 Internal Server Error`

#### `POST /hospedes` - Criar um Novo Hóspede

  * **Descrição**: Cria um novo hóspede no sistema.
  * **Corpo da Requisição**: `application/json`
    ```json
    {
      "nome": "Maria Souza",
      "documento": "987.654.321-10",
      "telefone": "21987654321",
      "email": "maria@example.com"
    }
    ```
  * **Resposta de Sucesso**: `201 Created`
    ```json
    {
      "id": 2,
      "nome": "Maria Souza",
      "documento": "987.654.321-10",
      "telefone": "21987654321",
      "email": "maria@example.com"
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Dados inválidos (ex: e-mail ou documento duplicado, formato inválido).
      * `500 Internal Server Error`

#### `PUT /hospedes/:id` - Atualizar um Hóspede

  * **Descrição**: Atualiza as informações de um hóspede existente.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do hóspede a ser atualizado.
  * **Corpo da Requisição**: `application/json` (Envie apenas os campos que deseja atualizar)
    ```json
    {
      "telefone": "21998887777"
    }
    ```
  * **Resposta de Sucesso**: `200 OK` (Retorna o hóspede atualizado)
    ```json
    {
      "id": 1,
      "nome": "João da Silva",
      "documento": "123.456.789-00",
      "telefone": "21998887777",
      "email": "joao@example.com"
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Dados inválidos.
      * `404 Not Found`: Hóspede não encontrado.
      * `500 Internal Server Error`

#### `DELETE /hospedes/:id` - Deletar um Hóspede

  * **Descrição**: Remove um hóspede do sistema.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID do hóspede a ser deletado.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "message": "Hóspede deletado com sucesso"
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Hóspede não encontrado.
      * `500 Internal Server Error`: Erro ao tentar deletar (ex: hóspede pode ter reservas associadas).

### 3.3 Reservas

#### `GET /reservas` - Listar todas as Reservas

  * **Descrição**: Retorna uma lista de todas as reservas, incluindo informações detalhadas do quarto e do hóspede.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    [
      {
        "id": 1,
        "dataEntrada": "2025-08-10",
        "dataSaida": "2025-08-15",
        "quartoId": 1,
        "hospedeId": 1,
        "status": "ATIVA",
        "Quarto": {
          "id": 1,
          "numero": "201",
          "tipo": "DUPLO",
          "status": "DISPONIVEL"
        },
        "Hospede": {
          "id": 1,
          "nome": "Carlos Sousa",
          "documento": "987654321"
        }
      }
    ]
    ```
  * **Resposta de Erro**: `500 Internal Server Error`

#### `GET /reservas/:id` - Obter Reserva por ID

  * **Descrição**: Retorna os detalhes de uma reserva específica, com informações do quarto e hóspede.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID da reserva.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "id": 1,
      "dataEntrada": "2025-08-10",
      "dataSaida": "2025-08-15",
      "quartoId": 1,
      "hospedeId": 1,
      "status": "ATIVA",
      "Quarto": {
        "id": 1,
        "numero": "201",
        "tipo": "DUPLO",
        "status": "DISPONIVEL"
      },
      "Hospede": {
        "id": 1,
        "nome": "Carlos Sousa",
        "documento": "987654321"
      }
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Reserva não encontrada.
      * `500 Internal Server Error`

#### `POST /reservas` - Criar uma Nova Reserva

  * **Descrição**: Cria uma nova reserva. Valida a disponibilidade do quarto para o período solicitado, considerando sobreposição de outras reservas e status do quarto (`MANUTENCAO`). O status inicial da reserva é sempre **`ATIVA`**. **O status do quarto não é alterado para `OCUPADO` na criação da reserva; isso ocorre no check-in.**
  * **Corpo da Requisição**: `application/json`
    ```json
    {
      "dataEntrada": "2025-09-01",
      "dataSaida": "2025-09-05",
      "quartoId": 1,
      "hospedeId": 1
    }
    ```
  * **Resposta de Sucesso**: `201 Created`
    ```json
    {
      "id": 2,
      "dataEntrada": "2025-09-01",
      "dataSaida": "2025-09-05",
      "quartoId": 1,
      "hospedeId": 1,
      "status": "ATIVA"
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Datas inválidas (`dataEntrada` \>= `dataSaida`) ou quarto não disponível para o período selecionado.
      * `404 Not Found`: Quarto ou hóspede não encontrado.
      * `500 Internal Server Error`

#### `PUT /reservas/:id` - Atualizar uma Reserva

  * **Descrição**: Atualiza as informações de uma reserva existente. A lógica de disponibilidade é reavaliada se o quarto ou as datas forem alterados. Permite mudar o `status` da reserva para `CANCELADA` ou `CONCLUIDA`.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID da reserva a ser atualizada.
  * **Corpo da Requisição**: `application/json` (Envie apenas os campos que deseja atualizar)
    ```json
    {
      "dataSaida": "2025-09-06",
      "status": "CANCELADA"
    }
    ```
  * **Resposta de Sucesso**: `200 OK` (Retorna a reserva atualizada)
    ```json
    {
      "id": 2,
      "dataEntrada": "2025-09-01",
      "dataSaida": "2025-09-06",
      "quartoId": 1,
      "hospedeId": 1,
      "status": "CANCELADA"
    }
    ```
    > **Observação**: Se o `status` for alterado de `ATIVA` para `CANCELADA` ou `CONCLUIDA`, e não houver outras reservas ativas para o quarto, o status do **quarto** pode ser revertido para `DISPONIVEL`.
  * **Respostas de Erro**:
      * `400 Bad Request`: Dados inválidos ou alteração não possível devido a conflito de disponibilidade.
      * `404 Not Found`: Reserva não encontrada.
      * `500 Internal Server Error`

#### `DELETE /reservas/:id` - Deletar uma Reserva

  * **Descrição**: Remove uma reserva do sistema. Se a reserva deletada estava `ATIVA` e era a única ativa para o quarto, o status do **quarto** pode ser revertido para `DISPONIVEL`.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID da reserva a ser deletada.
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "message": "Reserva deletada com sucesso"
    }
    ```
  * **Respostas de Erro**:
      * `404 Not Found`: Reserva não encontrada.
      * `500 Internal Server Error`

### 3.4 Operações de Check-in/Check-out

Estas operações são cruciais para gerenciar o status físico do quarto.

#### `POST /reservas/:id/checkin` - Realizar Check-in

  * **Descrição**: Realiza o check-in para uma reserva específica. O status da **reserva** permanece `ATIVA`, mas o status do **quarto** associado muda para **`OCUPADO`**.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID da reserva para check-in.
  * **Corpo da Requisição**: N/A (não é necessário corpo)
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "message": "Check-in da reserva 1 realizado. Quarto 201 agora está OCUPADO."
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Reserva não está no status `ATIVA`, ou quarto já está `OCUPADO`/`MANUTENCAO`.
      * `404 Not Found`: Reserva não encontrada.
      * `500 Internal Server Error`

#### `POST /reservas/:id/checkout` - Realizar Check-out

  * **Descrição**: Realiza o check-out para uma reserva específica. O status da **reserva** muda para **`CONCLUIDA`**. O status do **quarto** associado muda para **`DISPONIVEL`** *apenas se não houver outras reservas **`ATIVA`s e futuras** para ele*.
  * **Parâmetros de Path**:
      * `id` (obrigatório): O ID da reserva para check-out.
  * **Corpo da Requisição**: N/A (não é necessário corpo)
  * **Resposta de Sucesso**: `200 OK`
    ```json
    {
      "message": "Check-out da reserva 1 realizado. Quarto 201 agora está DISPONIVEL (se não houver outras reservas ativas)."
    }
    ```
  * **Respostas de Erro**:
      * `400 Bad Request`: Reserva não está no status `ATIVA`.
      * `404 Not Found`: Reserva não encontrada.
      * `500 Internal Server Error`

-----

## 4\. Instalação e Execução

### Pré-requisitos

  * [Node.js](https://nodejs.org/en/) (versão 14 ou superior)
  * [npm](https://www.npmjs.com/) (gerenciador de pacotes Node.js)

### Passos

1.  **Clone o repositório** (se houver um) ou crie a estrutura de arquivos:

    ```bash
    git clone <url-do-seu-repositorio> # Se aplicável
    cd hotel-api
    ```

    Ou crie as pastas e arquivos manualmente:

    ```bash
    mkdir hotel-api
    cd hotel-api
    mkdir src src/config src/models src/routes
    # Crie os arquivos .js dentro das pastas conforme o código-fonte fornecido
    ```

2.  **Inicialize o projeto Node.js**:

    ```bash
    npm init -y
    ```

3.  **Instale as dependências**:

    ```bash
    npm install express sequelize sqlite3 body-parser
    ```

4.  **Execute a aplicação**:

    ```bash
    node src/app.js
    ```

    A API será iniciada e estará disponível em `http://localhost:3000`. O banco de dados SQLite será criado automaticamente como `database.sqlite` na raiz do projeto.

-----

## 5\. Considerações

  * **Persistência**: O banco de dados SQLite (`database.sqlite`) é gerado localmente. Para ambientes de produção, considere um banco de dados mais robusto (PostgreSQL, MySQL) e utilize ferramentas de migração de schema (como as do Sequelize CLI).
  * **Autenticação e Autorização**: Esta API não inclui autenticação (quem pode acessar) ou autorização (o que cada um pode fazer). Para um ambiente de produção, é essencial implementar mecanismos como JWT (JSON Web Tokens).
  * **Validação de Entrada**: As validações básicas são feitas, mas para maior robustez, bibliotecas como `joi` ou `express-validator` podem ser usadas para validações de schema mais complexas.
  * **Tratamento de Erros**: Um middleware de tratamento de erros global pode ser adicionado para padronizar as respostas de erro da API.
  * **Logging**: Implemente um sistema de logging para monitorar as operações da API e depurar problemas.

-----