/// <reference types="cypress" />

describe('Login Test', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.visit('/auth/jwt/login/');
  });

  it('User try to sign in with incorrectly account', () => {
    cy.get('[data-cy="login-email"]').type(`wrogn@gmail.com`);
    cy.get('[data-cy="login-password"]').type('123');
    cy.intercept('POST', '**/auth/login').as('postLogin');
    cy.get('[data-cy="login-enter"]').click();
    cy.wait('@postLogin').then((interception) => {
      expect(interception.response?.statusCode).to.equal(401);
      expect(interception.response?.statusMessage).to.equal('Unauthorized');
      expect(interception.request?.url).to.include('/auth/login');
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

  it('User sign in as Admin', () => {
    cy.loginAdmin();
  });

  it('User sign in as Student', () => {
    cy.loginStudent();
  });
});
