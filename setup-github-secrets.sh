#!/bin/bash
# Script para configurar los secrets necesarios en GitHub Actions
# Requiere: gh auth login (ejecutar primero)

echo "Configurando secrets para GitHub Actions..."
echo ""

# Verificar que gh está autenticado
if ! gh auth status &>/dev/null; then
    echo "Error: No estás autenticado con GitHub CLI."
    echo "Ejecuta primero: gh auth login"
    exit 1
fi

echo "Introduce la clave SSH privada (termina con una línea vacía o EOF):"
SSH_KEY=$(cat)

echo ""
echo "Introduce el usuario SSH (ej: josejuan):"
read SSH_USER

echo ""
echo "Introduce el host SSH (ej: 89.167.64.170):"
read SSH_HOST

echo ""
echo "Configurando secrets en el repositorio..."

# Configurar secrets
echo "$SSH_KEY" | gh secret set SSH_PRIVATE_KEY -R origin
gh secret set SSH_USER -b"$SSH_USER" -R origin
gh secret set SSH_HOST -b"$SSH_HOST" -R origin
gh secret set TEST_URL -b"http://${SSH_HOST}:8012" -R origin

echo ""
echo "Secrets configurados correctamente:"
echo "  - SSH_PRIVATE_KEY"
echo "  - SSH_USER: $SSH_USER"
echo "  - SSH_HOST: $SSH_HOST"
echo "  - TEST_URL: http://${SSH_HOST}:8012"
echo ""
echo "Puedes verificar los secrets con: gh secret list"
