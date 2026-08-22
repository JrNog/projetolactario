#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
🏥 ASSISTENTE AUTOMÁTICO DE CONEXÃO • LACTÁRIO DIGITAL HSP / NUTRILAC
Configurador Inteligente de Banco de Dados no Google Drive / Google Sheets
===============================================================================
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import webbrowser
import subprocess
import platform

# Diretórios base
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
CODE_GS_PATH = os.path.join(SCRIPT_DIR, "Code.gs")
CONFIG_JS_PATH = os.path.join(PROJECT_ROOT, "js", "config.js")
NUTRILAC_CONFIG_JS_PATH = os.path.join(PROJECT_ROOT, "NutriLac", "js", "config.js")
INDEX_HTML_PATH = os.path.join(PROJECT_ROOT, "index.html")

# Cores ANSI para o Terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    RESET = '\033[0m'

def print_banner():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{Colors.BOLD}{Colors.CYAN}==============================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}   🏥  LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM) / NUTRILAC{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.YELLOW}       Assistente Automático de Conexão com Google Drive / Google Sheets{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}==============================================================================={Colors.RESET}\n")

def copiar_para_clipboard(texto):
    sistema = platform.system()
    try:
        if sistema == "Darwin":  # macOS
            processo = subprocess.Popen('pbcopy', env={'LANG': 'en_US.UTF-8'}, stdin=subprocess.PIPE)
            processo.communicate(texto.encode('utf-8'))
            return True
        elif sistema == "Windows":
            processo = subprocess.Popen('clip', stdin=subprocess.PIPE, shell=True)
            processo.communicate(texto.encode('utf-16le'))
            return True
        elif sistema == "Linux":
            try:
                processo = subprocess.Popen(['xclip', '-selection', 'clipboard'], stdin=subprocess.PIPE)
                processo.communicate(texto.encode('utf-8'))
                return True
            except FileNotFoundError:
                processo = subprocess.Popen(['xsel', '-b', '-i'], stdin=subprocess.PIPE)
                processo.communicate(texto.encode('utf-8'))
                return True
    except Exception as e:
        return False
    return False

def testar_url_api(url):
    if not url or not url.startswith("http"):
        return False, "URL inválida. Ela deve começar com https://script.google.com/..."
    
    if not url.endswith("/exec"):
        return False, "A URL da Web App deve terminar com '/exec'."

    url_ping = f"{url}?action=ping"
    try:
        req = urllib.request.Request(
            url_ping,
            headers={'User-Agent': 'Mozilla/5.0 (NutriLac-HSP-Configurator)'}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                data = json.loads(body)
                if data.get("status") == "success":
                    return True, data.get("message", "API Online com sucesso!")
                else:
                    return False, f"Resposta da API: {data.get('message', 'Erro desconhecido')}"
    except urllib.error.HTTPError as e:
        return False, f"Erro HTTP {e.code}: Certifique-se de selecionar 'Quem pode acessar: Qualquer pessoa' na implantação."
    except urllib.error.URLError as e:
        return False, f"Erro de conexão com o Google: {e.reason}"
    except json.JSONDecodeError:
        return False, "A resposta do Google Apps Script não veio em formato JSON válido."
    except Exception as e:
        return False, f"Falha na comunicação: {str(e)}"

def salvar_url_no_projeto(url):
    # 1. Atualiza js/config.js principal
    if os.path.exists(CONFIG_JS_PATH):
        with open(CONFIG_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Substitui API_URL_DEFAULT
        import re
        content_mod = re.sub(
            r'API_URL_DEFAULT:\s*["\'].*?["\']',
            f'API_URL_DEFAULT: "{url}"',
            content
        )
        with open(CONFIG_JS_PATH, "w", encoding="utf-8") as f:
            f.write(content_mod)

    # 2. Atualiza NutriLac/js/config.js
    if os.path.exists(NUTRILAC_CONFIG_JS_PATH):
        with open(NUTRILAC_CONFIG_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        
        import re
        content_mod = re.sub(
            r'API_URL_DEFAULT:\s*["\'].*?["\']',
            f'API_URL_DEFAULT: "{url}"',
            content
        )
        with open(NUTRILAC_CONFIG_JS_PATH, "w", encoding="utf-8") as f:
            f.write(content_mod)

def main():
    print_banner()

    if not os.path.exists(CODE_GS_PATH):
        print(f"{Colors.RED}❌ Erro: Arquivo {CODE_GS_PATH} não encontrado.{Colors.RESET}")
        sys.exit(1)

    with open(CODE_GS_PATH, "r", encoding="utf-8") as f:
        codigo_apps_script = f.read()

    print(f"{Colors.BOLD}Este assistente vai configurar a conexão com o Google Sheets em menos de 2 minutos.{Colors.RESET}\n")

    # Passo 1: Copia o código para a área de transferência
    print(f"{Colors.BOLD}{Colors.YELLOW}[PASSO 1/4]{Colors.RESET} {Colors.BOLD}Copiando o código do servidor...{Colors.RESET}")
    copiou = copiar_para_clipboard(codigo_apps_script)
    if copiou:
        print(f"  {Colors.GREEN}✅ O código do Apps Script foi copiado automaticamente para a sua Área de Transferência (Ctrl+C / Cmd+C)!{Colors.RESET}\n")
    else:
        print(f"  {Colors.YELLOW}⚠️ Não foi possível copiar automaticamente. O código está no arquivo backend/Code.gs.{Colors.RESET}\n")

    # Passo 2: Abertura do Google Sheets
    print(f"{Colors.BOLD}{Colors.YELLOW}[PASSO 2/4]{Colors.RESET} {Colors.BOLD}Abrir o Google Sheets no navegador{Colors.RESET}")
    print(f"  Pressione {Colors.CYAN}[ENTER]{Colors.RESET} para abrir o Google Sheets e criar a planilha oficial:")
    try:
        input()
    except KeyboardInterrupt:
        print("\nOperação cancelada pelo usuário.")
        sys.exit(0)

    print(f"  🌐 Abrindo o Google Sheets...")
    webbrowser.open("https://sheets.new")
    time.sleep(2)

    # Passo 3: Instruções rápidas no Apps Script
    print(f"\n{Colors.BOLD}{Colors.YELLOW}[PASSO 3/4]{Colors.RESET} {Colors.BOLD}Como colar o código na planilha (Leva 30 segundos):{Colors.RESET}")
    print(f"  1. Na planilha aberta, renomeie o título para: {Colors.BOLD}Lactário Digital - Banco de Dados HSP{Colors.RESET}")
    print(f"  2. No menu superior, clique em: {Colors.CYAN}Extensões{Colors.RESET} > {Colors.CYAN}Apps Script{Colors.RESET}")
    print(f"  3. No editor do Apps Script, apague o texto existente e pressione {Colors.CYAN}Ctrl+V (ou Cmd+V){Colors.RESET} para colar.")
    print(f"  4. Salve o código ({Colors.CYAN}Ctrl+S / Cmd+S{Colors.RESET}).")
    print(f"  5. Clique no botão azul {Colors.GREEN}Implantar{Colors.RESET} > {Colors.CYAN}Nova implantação{Colors.RESET}.")
    print(f"  6. Na engrenagem ⚙️ (tipo), selecione: {Colors.BOLD}Aplicativo da Web{Colors.RESET}.")
    print(f"  7. No campo {Colors.BOLD}Quem pode acessar{Colors.RESET}, selecione: {Colors.BOLD}{Colors.GREEN}Qualquer pessoa{Colors.RESET} (Anyone).")
    print(f"  8. Clique em {Colors.GREEN}Implantar{Colors.RESET}, conceda permissão de acesso e {Colors.BOLD}COPIE A URL DA WEB APP{Colors.RESET} (terminada em {Colors.CYAN}/exec{Colors.RESET}).\n")

    # Passo 4: Coleta e validação da URL
    print(f"{Colors.BOLD}{Colors.YELLOW}[PASSO 4/4]{Colors.RESET} {Colors.BOLD}Validação e Teste da Conexão{Colors.RESET}")
    while True:
        try:
            url_informada = input(f"\n{Colors.BOLD}👉 Cole a URL da Web App gerada aqui e pressione [ENTER]:{Colors.RESET}\n> ").strip()
        except KeyboardInterrupt:
            print("\nOperação cancelada.")
            sys.exit(0)

        if not url_informada:
            print(f"{Colors.RED}Por favor, cole a URL copiada do Google Apps Script.{Colors.RESET}")
            continue

        print(f"\n🔍 Testando comunicação com o Google Drive...")
        valido, mensagem = testar_url_api(url_informada)

        if valido:
            print(f"  {Colors.GREEN}🎉 SUCESSO! A planilha respondeu perfeitamente:{Colors.RESET}")
            print(f"  {Colors.CYAN}• Resposta do Servidor: {mensagem}{Colors.RESET}")
            salvar_url_no_projeto(url_informada)
            print(f"  {Colors.GREEN}✅ Configuração injetada e salva automaticamente na aplicação web!{Colors.RESET}\n")
            break
        else:
            print(f"  {Colors.RED}❌ Falha no teste: {mensagem}{Colors.RESET}")
            print(f"  {Colors.YELLOW}Dica: Verifique se a URL termina em '/exec' e se em 'Quem pode acessar' você selecionou 'Qualquer pessoa'.{Colors.RESET}")
            try:
                tentar_novamente = input(f"\nDeseja colar a URL novamente? (S/n): ").strip().lower()
                if tentar_novamente == 'n':
                    print("Assistente finalizado.")
                    sys.exit(0)
            except KeyboardInterrupt:
                sys.exit(0)

    print(f"{Colors.BOLD}{Colors.CYAN}==============================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}✨ CONFIGURAÇÃO CONCLUÍDA COM 100% DE SUCESSO!{Colors.RESET}")
    print(f"O Lactário Digital HSP agora está conectado em nuvem ao Google Sheets.")
    print(f"{Colors.BOLD}{Colors.CYAN}==============================================================================={Colors.RESET}\n")

    print(f"Pressione {Colors.CYAN}[ENTER]{Colors.RESET} para abrir o Lactário Digital no navegador:")
    try:
        input()
        webbrowser.open(f"file://{INDEX_HTML_PATH}")
    except:
        pass

if __name__ == "__main__":
    main()
