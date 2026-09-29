#!/usr/bin/env python3
"""
J&R Barbearia - Servidor Local de Desenvolvimento
Executa um servidor HTTP estático com suporte adequado a MIME types (PWA, SVG, JS).
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Desabilita cache estrito em dev para testes fluidos
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        content_type = super().guess_type(path)
        if path.endswith('.svg'):
            return 'image/svg+xml'
        elif path.endswith('.json') or path.endswith('.webmanifest'):
            return 'application/json'
        elif path.endswith('.js'):
            return 'application/javascript'
        return content_type

def get_local_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        local_url = f"http://localhost:{PORT}"
        network_url = f"http://{local_ip}:{PORT}"
        print(f"==================================================")
        print(f"  J&R Barbearia - Servidor Web Ativo!")
        print(f"  Computador:     {local_url}")
        print(f"  NO SEU CELULAR: {network_url}  📱")
        print(f"  Painel Admin:   {network_url}#admin")
        print(f"==================================================")
        print("  Dica Celular: Conecte o celular na mesma rede Wi-Fi.")
        print("  Pressione Ctrl+C para encerrar o servidor.")

        # Abre o navegador automaticamente se solicitado
        if "--open" in sys.argv:
            webbrowser.open(local_url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")

if __name__ == '__main__':
    run_server()
