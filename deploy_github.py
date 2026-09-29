#!/usr/bin/env python3
"""
Deploy automático da Barbearia J&R no GitHub e ativação do GitHub Pages.
"""

import subprocess
import os
import json
import urllib.request
import urllib.error
import time

CWD = os.path.dirname(os.path.abspath(__file__))
REPO_NAME = "jr-barbearia"

def get_github_token():
    print("==> 1. Autenticando com Git Credential Manager...")
    p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = p.communicate(input='protocol=https\nhost=github.com\n\n')
    for line in out.splitlines():
        if line.startswith('password='):
            return line.split('password=', 1)[1]
    raise Exception("Token do GitHub não encontrado.")

def main():
    token = get_github_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'JR-Barbearia-Deployer',
        'X-GitHub-Api-Version': '2022-11-28'
    }

    # 1. Pega usuário do GitHub
    req = urllib.request.Request('https://api.github.com/user', headers=headers)
    with urllib.request.urlopen(req) as resp:
        user_info = json.loads(resp.read().decode('utf-8'))
        username = user_info['login']
    print(f"[OK] Usuário GitHub autenticado: {username}")

    # 2. Cria repositório no GitHub se não existir
    print(f"==> 2. Verificando repositório '{REPO_NAME}' no GitHub...")
    repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
    try:
        check_req = urllib.request.Request(repo_url, headers=headers)
        with urllib.request.urlopen(check_req) as resp:
            print(f"[OK] Repositório já existe no GitHub!")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"==> Criando repositório '{REPO_NAME}' no GitHub...")
            create_payload = json.dumps({
                "name": REPO_NAME,
                "description": "💈 J&R Barbearia - Aplicação Mobile-First / PWA de Agendamento e Gestão para Juliano & Robert",
                "private": False,
                "has_issues": True,
                "has_projects": True,
                "has_wiki": False
            }).encode('utf-8')
            create_req = urllib.request.Request(
                'https://api.github.com/user/repos',
                data=create_payload,
                headers=headers,
                method='POST'
            )
            with urllib.request.urlopen(create_req) as resp:
                print(f"[OK] Repositório '{REPO_NAME}' criado com sucesso no GitHub!")
        else:
            raise e

    # 3. Inicializa Git local e faz Commit
    print("==> 3. Configurando repositório Git local...")
    subprocess.run(["git", "init"], cwd=CWD, check=True)
    subprocess.run(["git", "add", "."], cwd=CWD, check=True)
    
    # Commit (ignora se já commitado)
    commit_res = subprocess.run(["git", "commit", "-m", "feat: Lancamento oficial J&R Barbearia PWA - Juliano e Robert com Supabase"], cwd=CWD, capture_output=True, text=True)
    print(commit_res.stdout.strip() or "Nenhum arquivo novo para commit.")

    subprocess.run(["git", "branch", "-M", "main"], cwd=CWD, check=True)

    # 4. Configura remote e faz push
    print("==> 4. Enviando arquivos para o GitHub...")
    remote_target = f"https://{username}:{token}@github.com/{username}/{REPO_NAME}.git"
    
    # Remove origin antigo se existir
    subprocess.run(["git", "remote", "remove", "origin"], cwd=CWD, capture_output=True)
    subprocess.run(["git", "remote", "add", "origin", f"https://github.com/{username}/{REPO_NAME}.git"], cwd=CWD, check=True)

    # Push usando url com token
    push_res = subprocess.run(["git", "push", "-u", remote_target, "main", "--force"], cwd=CWD, capture_output=True, text=True)
    if push_res.returncode == 0:
        print("[OK] Código enviado para o GitHub com sucesso!")
    else:
        print(f"[ERRO NO PUSH]: {push_res.stderr}")
        raise Exception("Falha no git push")

    # 5. Ativa GitHub Pages
    print("==> 5. Configurando GitHub Pages...")
    pages_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/pages"
    pages_payload = json.dumps({
        "source": {
            "branch": "main",
            "path": "/"
        }
    }).encode('utf-8')

    try:
        pages_req = urllib.request.Request(pages_url, data=pages_payload, headers=headers, method='POST')
        with urllib.request.urlopen(pages_req) as resp:
            print("[OK] GitHub Pages ativado com sucesso!")
    except urllib.error.HTTPError as e:
        if e.code == 409 or e.code == 400:
            print("[INFO] GitHub Pages já está configurado ou processando.")
        else:
            print(f"[AVISO PAGES]: HTTP {e.code} -> {e.read().decode('utf-8')}")

    public_url = f"https://{username.lower()}.github.io/{REPO_NAME}/"
    admin_url = f"{public_url}#admin"

    print("\n==================================================")
    print("  🚀 DEPLOY REALIZADO COM SUCESSO!")
    print(f"  Repositório GitHub: https://github.com/{username}/{REPO_NAME}")
    print(f"  Site Online (PWA):  {public_url}")
    print(f"  Painel Admin:       {admin_url}")
    print("==================================================")
    print("Obs: O GitHub Pages leva cerca de 1 a 2 minutos para concluir a primeira publicação.")

if __name__ == '__main__':
    main()
