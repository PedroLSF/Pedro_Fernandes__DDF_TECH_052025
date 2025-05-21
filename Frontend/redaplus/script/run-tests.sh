CYPRESS_TESTS_DIR="../cypress/e2e/integration"

CYPRESS_CONFIG_FILE="../cypress.config.ts"

LOG_FILE="cypress-test-results.log"

echo "Executando testes..."
npx cypress run --config-file $CYPRESS_CONFIG_FILE --spec "$CYPRESS_TESTS_DIR/**/*.js" > $LOG_FILE

if [ $? -eq 0 ]; then
  echo "Todos os testes passaram com sucesso!"
else
  echo "Alguns testes falharam. Verifique o arquivo $LOG_FILE para mais detalhes."
fi
