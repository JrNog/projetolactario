# 📘 Guia de Conexão do Banco de Dados no Google Drive / Google Sheets
### Lactário Digital • Hospital São Paulo (UNIFESP-EPM) / NutriLac

Este guia apresenta duas formas de conectar o sistema à sua planilha no Google Drive:
1. **Opção A (Recomendada):** Usando o **Assistente Automático de 1 Clique** (Leva menos de 1 minuto).
2. **Opção B:** Configuração manual tradicional pelo editor do Google Sheets.

---

## ⚡ 1. Modo Automático de 1 Clique (Assistente Inteligente)

Criamos um assistente executável que abre o Google Sheets, copia o código do servidor para sua área de transferência, testa a conexão e configura o sistema sozinho.

### Como Executar:

* **No macOS:**
  1. Dê um duplo clique no arquivo **`configurar_google_drive.command`** na pasta do projeto.
  2. Siga as instruções na tela do terminal.

* **No Windows:**
  1. Dê um duplo clique no arquivo **`configurar_google_drive.bat`** na pasta do projeto.
  2. Siga as instruções na tela.

* **Pelo Terminal (Linux / Mac / Windows):**
  ```bash
  python3 backend/configurador_google_drive.py
  ```

### O que o Assistente faz por você:
1. 📋 Copia o código do servidor (`backend/Code.gs`) direto para a sua área de transferência (`Ctrl+C` / `Cmd+C`).
2. 🌐 Abre uma nova planilha oficial no Google Sheets com 1 tecla.
3. 🧪 Faz o teste de comunicação HTTP da URL `/exec` gerada.
4. 💾 Salva e injeta a conexão diretamente na aplicação web.
5. 🚀 Abre o Lactário Digital já conectado com o selo verde **🟢 Google Sheets Conectado**.

---

## 🛠️ 2. Modo Manual Passo a Passo (Alternativa)

Caso prefira fazer a configuração manual sem o assistente:

### Passo 1: Criar a Planilha no Google Drive
1. Acesse o [Google Drive](https://drive.google.com) ou abra [sheets.new](https://sheets.new).
2. Renomeie a planilha para `Lactário Digital - Banco de Dados HSP`.

### Passo 2: Inserir o Código (Apps Script)
1. No menu superior da planilha, clique em: **Extensões** > **Apps Script**.
2. Apague qualquer código de exemplo existente no editor.
3. Abra o arquivo `backend/Code.gs` do projeto, copie todo o seu conteúdo e cole no editor.
4. Salve (`Ctrl + S` ou `Cmd + S`).

### Passo 3: Publicar a API (Implantar como Aplicativo da Web)
1. No canto superior direito, clique em **Implantar** (*Deploy*) > **Nova implantação** (*New deployment*).
2. Na engrenagem ⚙️ (*Tipo*), escolha **Aplicativo da Web** (*Web app*).
3. Preencha os campos:
   * **Descrição**: `API Lactário Digital HSP`
   * **Executar como**: `Eu (seu-email@...)`
   * **Quem pode acessar**: `Qualquer pessoa` (*Anyone*)
4. Clique em **Implantar** (*Deploy*).
5. Conceda as permissões de acesso da sua conta Google:
   * Clique em *Revisar permissões* > Escolha sua conta > *Avançado* > *Acessar API Lactário Digital HSP (não seguro)* > *Permitir*.
6. **Copie a URL da Web App gerada** (terminada em `/exec`).

### Passo 4: Conectar no Lactário Digital
1. Abra o Lactário Digital no navegador.
2. Acesse a aba **Configurações e Catálogo** > sub-aba **📊 Conexão Google Sheets**.
3. Cole a URL copiada no campo correspondente e clique em **💾 Salvar Conexão**.
4. Clique em **🔄 Testar Conexão** para validar.

---

## 🔒 3. Segurança e Modo Offline da Bancada

* **Sem necessidade de logins diários:** Uma vez configurada a URL, o sistema permanece conectado para sempre em qualquer máquina ou turno de trabalho.
* **Resiliência Offline Total:** Caso a rede do hospital oscile ou fique sem internet, o Lactário Digital armazena todas as alterações com segurança no banco local (`localStorage`) e sincroniza automaticamente com o Google Drive assim que a conexão retornar.
