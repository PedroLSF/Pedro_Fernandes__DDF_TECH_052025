/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Login Test', { testIsolation: true }, () => {
  let userEmail: string;
  beforeEach(() => {
    cy.visit('/auth/jwt/login/');
    userEmail = faker.person.firstName();
  });

  it('User try to sign in with incorrectly account', () => {
    cy.get('[data-cy="login-email"]').type(`${userEmail}@gmail.com`);
    cy.get('[data-cy="login-password"]').type(Cypress.env('user_password'));
    cy.intercept('POST', '**/auth/sign-in').as('postLogin');
    cy.get('[data-cy="login-enter"]').click();
    cy.wait('@postLogin').then((interception) => {
      expect(interception.response?.statusCode).to.equal(401);
      expect(interception.response?.statusMessage).to.equal('Unauthorized');
      expect(interception.request?.url).to.include('/auth/sign-in');
    });
    cy.get('.MuiAlert-message').should('be.visible');
  });

  it('User dont type email', () => {
    cy.get('[data-cy="login-password"]').type('user_password');
    cy.get('[data-cy="login-enter"]').click();
    cy.contains('Email é obrigatório.')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('Invalid email', () => {
    cy.get(`[data-cy="login-email"]`).type('eu sou Mauricio');
    cy.get(`[data-cy="login-enter"]`).click();
    cy.contains('Email deve ser válido.')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('Empty email and password', () => {
    cy.get(`[data-cy="login-enter"]`).click();
    cy.contains('Email é obrigatório.')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
    cy.contains('Senha é obrigatório.')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('Empty password', () => {
    cy.get(`[data-cy="login-email"]`).type('email@gmail.com');
    cy.get(`[data-cy="login-enter"]`).click();
    cy.contains('Senha é obrigatório.')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User sign in', () => {
    cy.get('[data-cy="login-email"]').type(Cypress.env('user_name'));
    cy.get('[data-cy="login-password"]').type(Cypress.env('user_password'), { log: false });
    cy.intercept('POST', '**/auth/sign-in').as('postLogin');
    cy.get('[data-cy="login-enter"]').click();
    cy.wait('@postLogin').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.statusMessage).to.equal('OK');
    });
    cy.contains('Olá! Bem-vindo(a) de volta,').should('be.visible');
  });
});
