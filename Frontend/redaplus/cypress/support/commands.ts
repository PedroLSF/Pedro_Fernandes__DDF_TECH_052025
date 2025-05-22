/// <reference types="cypress" />

Cypress.Commands.add('loginAdmin', () => {
  cy.get('[data-cy="login-email"]').type('siqueira@example.net');
  cy.get('[data-cy="login-password"]').type('Xpd5t', { log: false });
  cy.intercept('POST', '**/auth/login').as('postLogin');
  cy.get('[data-cy="login-enter"]').click();
  cy.wait('@postLogin');
});

Cypress.Commands.add('loginStudent', () => {
  cy.get('[data-cy="login-email"]').type('barbosahadassa@example.net');
  cy.get('[data-cy="login-password"]').type('Xp4V3yY$B&', { log: false });
  cy.intercept('POST', '**/auth/login').as('postLogin');
  cy.get('[data-cy="login-enter"]').click();
  cy.wait('@postLogin');
});

Cypress.Commands.add('logout', () => {
  cy.get('.MuiAvatar-img', { timeout: 6000 }).click();
  cy.contains('Sair').click();
});

declare namespace Cypress {
  interface Chainable {
    loginAdmin(): Chainable<void>;
    loginStudent(): Chainable<void>;
    logout(): Chainable<void>;
  }
}
