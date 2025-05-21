/// <reference types="cypress" />

describe('Error page', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('user sees error page', () => {
    cy.request({url: '/404', failOnStatusCode: false}).its('status').should('equal', 404);
    cy.visit('/404', {failOnStatusCode: false});
    cy.contains('Ops, aí eu não consigo!').should('be.visible');
    cy.get('.MuiStack-root > .MuiTypography-root').should('be.visible'); // TODO - adicionar data-cy
    cy.get('.MuiStack-root > .css-0 > .MuiButtonBase-root').should('be.visible'); // TODO - adicionar data-cy
  });

  it('user sees error page and goes back to home page', () => {
    cy.request({url: '/404', failOnStatusCode: false}).its('status').should('equal', 404);
    cy.visit('/404', {failOnStatusCode: false});
    cy.contains('Ops, aí eu não consigo!').should('be.visible');
    cy.get('.MuiStack-root > .MuiTypography-root').should('be.visible'); // TODO - adicionar data-cy
    cy.get('.MuiStack-root > .css-0 > .MuiButtonBase-root') // TODO - adicionar data-cy
      .should('be.visible')
      .click();
    cy.contains('Olá! Bem-vindo(a) de volta,').should('be.visible');  
  });
});