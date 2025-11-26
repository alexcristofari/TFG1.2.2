# TFG_VERSAO_FINAL/run.py (v5.0 - O Final)
from backend import create_app

# Este é o único código necessário aqui.
# Ele importa a função create_app de dentro do nosso pacote 'backend'
# e a executa.

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
