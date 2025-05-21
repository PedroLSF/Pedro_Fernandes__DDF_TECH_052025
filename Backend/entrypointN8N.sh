#!/bin/sh
set -e

echo "Importando workflow..."
n8n import:workflow --input=/home/node/import/exported-workflows.json

echo "Iniciando n8n..."
exec n8n start
