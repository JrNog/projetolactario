import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def replace_ampersand_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Preservar && substituindo temporariamente
    content = content.replace('&&', '__DOUBLE_AMP__')
    content = content.replace('&times;', '__TIMES__')
    content = content.replace('&quot;', '__QUOT__')
    content = content.replace('&bull;', '__BULL__')
    content = content.replace('&nbsp;', '__NBSP__')

    # Substituir " & " por " e "
    content = content.replace(' & ', ' e ')
    content = content.replace('&amp;', 'e')

    # Restaurar entidades e operadores
    content = content.replace('__DOUBLE_AMP__', '&&')
    content = content.replace('__TIMES__', '&times;')
    content = content.replace('__QUOT__', '&quot;')
    content = content.replace('__BULL__', '&bull;')
    content = content.replace('__NBSP__', '&nbsp;')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Atualizado: {filepath}")

def main():
    target_files = [
        "index.html",
        "js/app.js",
        "js/modules/censo.js",
        "js/modules/planilhas-censo.js",
        "js/modules/bancada.js",
        "js/modules/spdm.js",
        "js/modules/etiquetas.js",
        "js/modules/compras.js",
        "js/modules/dashboard.js",
        "js/modules/evolucao.js",
        "js/services/api.js",
        "js/data/dietas-padrao.js",
        "js/data/enfermarias-spdm.js",
        "README.md",
        "lactario-digital.md"
    ]

    for rel in target_files:
        full_path = os.path.join(BASE_DIR, rel)
        if os.path.exists(full_path):
            replace_ampersand_in_file(full_path)

if __name__ == "__main__":
    main()
