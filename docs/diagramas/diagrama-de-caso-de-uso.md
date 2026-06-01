# Diagrama de Caso de Uso - Sonhário

```mermaid
graph LR
    %% Definição do Ator
    subgraph Ator
        Usuario(((Usuário)))
    end

    %% Fronteira do Sistema
    subgraph Sistema Sonhário
        UC1[Cadastrar-se]
        UC2[Fazer Login]
        UC3[Recuperar Senha]
        UC4[Alterar Senha]
        UC5[Criar Registro de Sonho]
        UC6[Listar Registros]
        UC7[Visualizar Registro]
        UC8[Editar Registro]
        UC9[Deletar Registro]
        UC10[Melhorar Registro com IA]
        UC11[Transcrever Voz para Texto]
        UC12[Pesquisar Registros]
        UC13[Fazer Logout]
    end

    %% Associações do Usuário
    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5
    Usuario --> UC6
    Usuario --> UC7
    Usuario --> UC8
    Usuario --> UC9
    Usuario --> UC10
    Usuario --> UC11
    Usuario --> UC12
    Usuario --> UC13

    %% Relacionamentos de Include (Requerem Login)
    UC4 -.->|include| UC2
    UC5 -.->|include| UC2
    UC6 -.->|include| UC2
    UC7 -.->|include| UC2
    UC8 -.->|include| UC2
    UC9 -.->|include| UC2
    UC10 -.->|include| UC2
    UC11 -.->|include| UC2
    UC12 -.->|include| UC2
    UC13 -.->|include| UC2
```

## Descrição dos Casos de Uso

### Casos de Uso de Autenticação

1. **Cadastrar-se**
   - Permite que um novo usuário crie uma conta no sistema
   - Requer nome, e-mail e senha

2. **Fazer Login**
   - Autentica o usuário no sistema usando e-mail e senha
   - Gera um token JWT para sessão autenticada
   - Pré-requisito para a maioria dos casos de uso

3. **Recuperar Senha**
   - Permite que o usuário solicite uma nova senha via e-mail
   - Não requer autenticação prévia

4. **Alterar Senha**
   - Permite que o usuário autenticado altere sua senha
   - Requer a senha atual e a nova senha

5. **Fazer Logout**
   - Encerra a sessão do usuário
   - Limpa os dados armazenados localmente

### Casos de Uso de Registros de Sonhos

6. **Criar Registro de Sonho**
   - Permite que o usuário crie um novo registro de sonho
   - Pode usar transcrição de voz ou texto manual

7. **Listar Registros**
   - Exibe todos os registros de sonhos do usuário
   - Ordenados por data de criação (mais recente primeiro)

8. **Visualizar Registro**
   - Mostra o conteúdo completo de um registro selecionado

9. **Editar Registro**
   - Permite alterar o conteúdo de um registro existente
   - Registra a data da alteração

10. **Deletar Registro**
    - Remove permanentemente um registro
    - Requer confirmação do usuário

11. **Melhorar Registro com IA**
    - Usa inteligência artificial para melhorar a descrição do sonho
    - Requer que o registro tenha pelo menos 5 caracteres

12. **Transcrever Voz para Texto**
    - Converte fala em texto para facilitar a criação/edição de registros
    - Suporta pausa e retomada da gravação

13. **Pesquisar Registros**
    - Permite buscar registros por termos específicos
    - Busca case-insensitive e ignora acentos

## Relacionamentos

- Os casos de uso de **4 a 13** incluem o caso de uso **Fazer Login**, ou seja, requerem que o usuário esteja autenticado.
