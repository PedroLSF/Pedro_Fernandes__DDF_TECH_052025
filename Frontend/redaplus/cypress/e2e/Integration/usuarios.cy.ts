/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('User Test', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.visit('/auth/jwt/login/');
    cy.loginAdmin();
  });

  it('User create a user', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-name"]').type(faker.person.fullName());
    cy.get('[data-cy="forgot-password-new-password"]').type(faker.word.words());
    cy.get('[data-cy="user-email"]').type(faker.internet.email());
    cy.get('[data-cy="user-phone"]').type('62985498368');
    cy.intercept('POST', '**/user').as('postUser');
    cy.contains('Criar Usuário').click();
    cy.wait('@postUser').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.statusMessage).to.equal('OK');
    });
  });
});
