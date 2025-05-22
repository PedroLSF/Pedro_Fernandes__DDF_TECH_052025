/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Redacao Test', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.visit('/auth/jwt/login/');
    cy.loginStudent();
  });

  it('User create a essay', () => {
    cy.visit('/dashboard/essay/list/');
    cy.contains('Nova Redação').click();
    cy.get('[data-cy="title-name"]').type(faker.person.jobTitle());
    cy.get('[data-cy="theme-name"]').type(faker.person.jobTitle());
    cy.get('[data-cy="user-essay"]').type(faker.person.jobTitle());
    cy.intercept('POST', '**/essay').as('postEssay');
    cy.contains('Criar Redação').click();
    cy.wait('@postEssay').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.statusMessage).to.equal('OK');
    });
  });
});
