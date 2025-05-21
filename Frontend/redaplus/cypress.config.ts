const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8083',
    viewportWidth: 1440,
    viewportHeight: 1080,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/mochawesome',
      overwrite: true,
      quiet: true,
      html: true,
      json: false,
    },
  },
});
