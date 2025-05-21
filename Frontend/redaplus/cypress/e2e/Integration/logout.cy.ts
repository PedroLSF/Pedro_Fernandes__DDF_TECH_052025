/// <reference types="cypress" />

describe('Logout', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('User logout', () => {
    cy.get('.MuiAvatar-img').click();
    cy.contains('Sair').click();
    cy.url().should('include', '/auth/jwt/login/');
    cy.get('[data-cy="login-enter"]').should('be.visible');
  });
});
