/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Redacao Test', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.visit('/auth/jwt/login/');
    cy.loginStudent();
  });

  it('User create a planning', () => {
    cy.visit('/dashboard/planning/new/');
    cy.get('[data-cy="user-planning"]').type(faker.person.jobTitle());
    cy.get('[data-cy="user-theme"]').type(faker.person.jobTitle());
    cy.intercept('POST', '**/webhook/*').as('postPlanning');
    cy.contains('Criar Planejamento').click();
    cy.wait('@postPlanning', { timeout: 20000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.statusMessage).to.equal('OK');
    });
  });
});
