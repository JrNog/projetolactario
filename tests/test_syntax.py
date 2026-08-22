import glob
import os

def check_js_syntax(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
    
    chars = []
    i = 0
    n = len(code)
    in_single_str = False
    in_double_str = False
    in_backtick_str = False
    in_line_comment = False
    in_block_comment = False
    in_regex = False

    while i < n:
        c = code[i]
        nxt = code[i+1] if i+1 < n else ''

        if in_line_comment:
            if c == '\n':
                in_line_comment = False
        elif in_block_comment:
            if c == '*' and nxt == '/':
                in_block_comment = False
                i += 1
        elif in_single_str:
            if c == '\\':
                i += 1
            elif c == '\'':
                in_single_str = False
        elif in_double_str:
            if c == '\\':
                i += 1
            elif c == '"':
                in_double_str = False
        elif in_backtick_str:
            if c == '\\':
                i += 1
            elif c == '`':
                in_backtick_str = False
        elif in_regex:
            if c == '\\':
                i += 1
            elif c == '/':
                in_regex = False
        else:
            if c == '/' and nxt == '/':
                in_line_comment = True
                i += 1
            elif c == '/' and nxt == '*':
                in_block_comment = True
                i += 1
            elif c == '/' and not in_regex:
                prev_non_ws = ''
                for k in range(i-1, -1, -1):
                    if not code[k].isspace():
                        prev_non_ws = code[k]
                        break
                if prev_non_ws in '(=,[{:;!&|?':
                    in_regex = True
            elif c == '\'':
                in_single_str = True
            elif c == '"':
                in_double_str = True
            elif c == '`':
                in_backtick_str = True
            elif c in '(){}[]':
                chars.append((c, i))
        i += 1

    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for ch, pos in chars:
        if ch in '({[':
            stack.append((ch, pos))
        elif ch in ')}]':
            if not stack or stack[-1][0] != pairs[ch]:
                return f"Mismatched {ch} at index {pos}"
            stack.pop()

    if stack:
        return f"Unclosed {stack[-1][0]} at index {stack[-1][1]}"
    return None

def test_all():
    js_files = glob.glob('js/**/*.js', recursive=True)
    all_ok = True
    for jf in sorted(js_files):
        err = check_js_syntax(jf)
        if err:
            print(f"❌ {jf}: {err}")
            all_ok = False
        else:
            print(f"✅ {jf}: OK")

    assert all_ok, "Some JS files have syntax delimiter errors!"

    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Modal Dieta Especial Elements
    assert 'modal-container-dieta-especial' in html, "Missing modal-container-dieta-especial in index.html"
    assert 'modal-dieta-especial-desc' in html, "Missing modal-dieta-especial-desc input in index.html"
    assert 'modal-dieta-especial-qtd' in html, "Missing modal-dieta-especial-qtd input in index.html"

    with open('js/data/dietas-padrao.js', 'r', encoding='utf-8') as f:
        dietas = f.read()
    assert 'dieta_especial' in dietas, "Missing dieta_especial in dietas-padrao.js"

    with open('js/app.js', 'r', encoding='utf-8') as f:
        app = f.read()
    assert 'AUTOCLAVADA' in app, "Missing Autoclavadas grouping in app.js"
    assert 'NAO_AUTOCLAVADA' in app, "Missing Nao Autoclavadas grouping in app.js"
    assert 'atualizarVisibilidadeDietaEspecialModal' in app, "Missing atualizarVisibilidadeDietaEspecialModal in app.js"
    assert 'dietaEspecialDesc' in app, "Missing dietaEspecialDesc in app.js"
    assert 'dietaEspecialQtd' in app, "Missing dietaEspecialQtd in app.js"

    # SPDM & Turnos Web Integration
    assert 'id="tab-spdm"' in html, "Missing id=tab-spdm section in index.html"
    assert 'data-tab="spdm"' in html, "Missing data-tab=spdm in nav of index.html"
    assert 'enfermarias-spdm.js' in html, "Missing enfermarias-spdm.js script inclusion in index.html"
    assert 'spdm.js' in html, "Missing spdm.js script inclusion in index.html"
    assert 'btn-visao-soma_autoclavada' in html, "Missing btn-visao-soma_autoclavada in index.html"
    assert 'btn-visao-soma_nao_autoclavada' in html, "Missing btn-visao-soma_nao_autoclavada in index.html"
    assert 'btn-visao-soma_enteral' in html, "Missing btn-visao-soma_enteral in index.html"

    with open('js/data/enfermarias-spdm.js', 'r', encoding='utf-8') as f:
        enf = f.read()
    assert 'ENFERMARIAS_SPDM' in enf, "Missing ENFERMARIAS_SPDM in enfermarias-spdm.js"

    with open('js/modules/spdm.js', 'r', encoding='utf-8') as f:
        spdm_js = f.read()
    assert 'SpdmModule' in spdm_js, "Missing SpdmModule in spdm.js"
    assert 'calcularCensoSPDM' in spdm_js, "Missing calcularCensoSPDM in spdm.js"
    assert 'renderizarAba' in spdm_js, "Missing renderizarAba in spdm.js"

    with open('js/modules/bancada.js', 'r', encoding='utf-8') as f:
        bancada_js = f.read()
    assert 'classificarTurnoHorario' in bancada_js, "Missing classificarTurnoHorario in bancada.js"
    assert 'CONFIG_SOMAS' in bancada_js, "Missing CONFIG_SOMAS in bancada.js"
    assert 'gerarHtmlPlanilhaSoma' in bancada_js, "Missing gerarHtmlPlanilhaSoma in bancada.js"
    assert 'VOLUME AUTOCLAVADA' in bancada_js, "Missing VOLUME AUTOCLAVADA in bancada.js"
    assert 'VOLUME NÃO AUTOCLAVADA' in bancada_js, "Missing VOLUME NÃO AUTOCLAVADA in bancada.js"
    assert 'VOLUME ENTERAL' in bancada_js, "Missing VOLUME ENTERAL in bancada.js"

    with open('js/modules/compras.js', 'r', encoding='utf-8') as f:
        compras_js = f.read()
    assert 'ITENS_PEDIDO_OFICIAL' in compras_js, "Missing ITENS_PEDIDO_OFICIAL in compras.js"
    assert 'formsDesc' in compras_js, "Missing formsDesc in compras.js"
    assert 'copiarTextoForms' in compras_js, "Missing copiarTextoForms in compras.js"
    assert 'exportarCSVPedido' in compras_js, "Missing exportarCSVPedido in compras.js"
    assert 'imprimirPedidoA4' in compras_js, "Missing imprimirPedidoA4 in compras.js"

    # Planilhas Censo (Autoclavada, Não Autoclavada, Dieta Especial)
    assert 'planilhas-censo.js' in html, "Missing planilhas-censo.js script inclusion in index.html"
    assert 'btn-censo-visao-autoclavada' in html, "Missing btn-censo-visao-autoclavada in index.html"
    assert 'btn-censo-visao-nao_autoclavada' in html, "Missing btn-censo-visao-nao_autoclavada in index.html"
    assert 'btn-censo-visao-dieta_especial' in html, "Missing btn-censo-visao-dieta_especial in index.html"

    with open('js/modules/planilhas-censo.js', 'r', encoding='utf-8') as f:
        planilhas_js = f.read()
    assert 'PlanilhasCensoModule' in planilhas_js, "Missing PlanilhasCensoModule in planilhas-censo.js"
    assert 'SECOES_AUTOCLAVADA' in planilhas_js, "Missing SECOES_AUTOCLAVADA in planilhas-censo.js"
    assert 'SECOES_NAO_AUTOCLAVADA' in planilhas_js, "Missing SECOES_NAO_AUTOCLAVADA in planilhas-censo.js"
    assert 'processarDietaEspecial' in planilhas_js, "Missing processarDietaEspecial in planilhas-censo.js"

    assert 'renderizarSPDM' in app, "Missing renderizarSPDM in app.js"
    assert 'renderizarCompras' in app, "Missing renderizarCompras in app.js"
    assert 'setVisaoCenso' in app, "Missing setVisaoCenso in app.js"
    assert 'exportarPlanilhaCensoCSV' in app, "Missing exportarPlanilhaCensoCSV in app.js"
    assert 'imprimirPlanilhaCensoA4' in app, "Missing imprimirPlanilhaCensoA4 in app.js"

    print("\n🎉 ALL WEB APPLICATION SOMA, SPDM, PEDIDO, PLANILHAS CENSO, AND SYNTAX TESTS PASSED 100%!")

if __name__ == '__main__':
    test_all()
