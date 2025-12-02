#!/bin/bash

# Script de Automação de Deploy para Fly.io
# Deve ser executado no diretório raiz do projeto (TFG1.2.2)
# Requer: flyctl instalado e logado, Git Bash/WSL (Linux) ou PowerShell (Windows)

# --- Configurações ---
SERVICES=(
    "backend/steam"
    "backend/music"
    "backend/movies"
    "api-gateway"
)

# --- Funções ---

deploy_service() {
    local service_dir=$1
    local service_name=$(basename "$service_dir")
    
    echo "=================================================="
    echo "Iniciando deploy do serviço: $service_name"
    echo "=================================================="
    
    # Entra no diretório do serviço
    cd "$service_dir" || { echo "Erro: Diretório $service_dir não encontrado."; exit 1; }
    
    # 1. flyctl launch (Cria o app no Fly.io se não existir)
    echo "-> Executando flyctl launch..."
    # Usamos --copy-config para garantir que o fly.toml seja usado
    flyctl launch --copy-config --no-deploy
    
    # 2. flyctl deploy (Faz o build e o deploy)
    echo "-> Executando flyctl deploy..."
    flyctl deploy
    
    # Volta para o diretório raiz
    cd - > /dev/null
    
    echo "=================================================="
    echo "Deploy de $service_name concluído."
    echo "=================================================="
}

# --- Execução ---

echo "Iniciando processo de deploy sequencial no Fly.io..."

# Deploy dos Backends (ordem não importa)
for service in "${SERVICES[@]}"; do
    deploy_service "$service"
done

echo "=================================================="
echo "✅ Processo de deploy de todos os microsserviços concluído!"
echo "=================================================="
echo "Próximo passo: Configurar o Frontend com o URL público do API Gateway."
echo "O URL público do API Gateway é: https://tfg-api-gateway.fly.dev"
echo "(Se você alterou o nome do app no fly.toml, use o nome correto)"