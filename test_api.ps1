# test_api.ps1 - Script de teste da API

$BASE_URL = "http://localhost:5000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧪 TESTANDO API - FASE 3" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Teste de conexão
Write-Host "1️⃣ Testando conexão com banco..." -ForegroundColor Yellow
$response = curl -Uri "$BASE_URL/api/auth/test-db" | ConvertFrom-Json
Write-Host "   ✅ $($response.message)" -ForegroundColor Green
Write-Host "   Total de usuários: $($response.total_usuarios)`n"

# 2. Registro
Write-Host "2️⃣ Criando conta de teste..." -ForegroundColor Yellow
$registerData = @{
    name = "Usuario Teste"
    email = "teste@teste.com"
    password = "123456"
} | ConvertTo-Json

try {
    $response = curl -Uri "$BASE_URL/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $registerData | ConvertFrom-Json
    
    Write-Host "   ✅ $($response.message)" -ForegroundColor Green
    $TOKEN = $response.token
    Write-Host "   Token obtido!`n"
} catch {
    Write-Host "   ⚠ Usuário já existe, fazendo login...`n" -ForegroundColor Yellow
}

# 3. Login
Write-Host "3️⃣ Fazendo login..." -ForegroundColor Yellow
$loginData = @{
    email = "teste@teste.com"
    password = "123456"
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginData | ConvertFrom-Json

$TOKEN = $response.token
Write-Host "   ✅ Login bem-sucedido!" -ForegroundColor Green
Write-Host "   Usuário: $($response.user.name)`n"

# 4. Listar listas (deve estar vazio)
Write-Host "4️⃣ Listando listas..." -ForegroundColor Yellow
$response = curl -Uri "$BASE_URL/api/listas" `
    -Headers @{"Authorization"="Bearer $TOKEN"} | ConvertFrom-Json

Write-Host "   ✅ Total de listas: $($response.listas.Count)`n"

# 5. Criar lista
Write-Host "5️⃣ Criando nova lista..." -ForegroundColor Yellow
$listaData = @{
    nome = "Meus Jogos Favoritos"
    descricao = "Lista teste"
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/listas" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
    -Body $listaData | ConvertFrom-Json

$LISTA_ID = $response.lista.id
Write-Host "   ✅ Lista criada! ID: $LISTA_ID`n"

# 6. Adicionar jogo à lista (Counter-Strike = ID 1)
Write-Host "6️⃣ Adicionando jogo à lista..." -ForegroundColor Yellow
$itemData = @{
    midia_id = 1
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/listas/$LISTA_ID/itens" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
    -Body $itemData | ConvertFrom-Json

Write-Host "   ✅ $($response.message)`n"

# 7. Ver detalhes da lista
Write-Host "7️⃣ Visualizando lista..." -ForegroundColor Yellow
$response = curl -Uri "$BASE_URL/api/listas/$LISTA_ID" `
    -Headers @{"Authorization"="Bearer $TOKEN"} | ConvertFrom-Json

Write-Host "   ✅ Lista: $($response.lista.nome)"
Write-Host "   Total de itens: $($response.lista.itens.Count)`n"

# 8. Criar avaliação
Write-Host "8️⃣ Criando avaliação..." -ForegroundColor Yellow
$avaliacaoData = @{
    midia_id = 1
    nota = 9.5
    comentario = "Jogo incrível!"
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/avaliacoes" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
    -Body $avaliacaoData | ConvertFrom-Json

Write-Host "   ✅ $($response.message)`n"

# 9. Ver minhas avaliações
Write-Host "9️⃣ Listando minhas avaliações..." -ForegroundColor Yellow
$response = curl -Uri "$BASE_URL/api/avaliacoes/minhas" `
    -Headers @{"Authorization"="Bearer $TOKEN"} | ConvertFrom-Json

Write-Host "   ✅ Total de avaliações: $($response.avaliacoes.Count)`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ TODOS OS TESTES CONCLUÍDOS!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan