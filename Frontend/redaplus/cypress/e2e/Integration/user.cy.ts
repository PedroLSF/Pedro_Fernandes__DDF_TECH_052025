/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('User', () => {
  let userName: string
  let roleName: string
  let categoryName: string
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
    userName = faker.person.firstName();
    roleName = faker.person.firstName();
    categoryName = faker.person.firstName();
  });

  it('User create a user sucessfully', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-name"]').type(userName);
    cy.get('[data-cy="user-email"]').type(`${userName}@gmail.com`);
    cy.intercept('POST', '**/user').as('postUser');
    cy.get('[data-cy="user-save"]').click();
    cy.wait('@postUser');
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Novo usuário criado!');
    cy.contains('span', userName).should('be.visible');
  });

  it('User doesnt type name and email', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-save"]').click();
    cy.contains('Nome é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
    cy.contains('E-mail é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User doesnt type name', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-save"]').click();
    cy.get('[data-cy="user-email"]').type(Cypress.env('user_name'));
    cy.contains('Nome é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User doesnt type email', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-save"]').click();
    cy.get('[data-cy="user-name"]').type(`Nome-${Math.random()}`);
    cy.contains('E-mail é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User types a email already used', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="new-user-button"]').click();
    cy.get('[data-cy="user-name"]').type(`Nome-${Math.random()}`);
    cy.get('[data-cy="user-email"]').type(Cypress.env('user_name'));
    cy.get('[data-cy="user-save"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Erro ao criar novo usuário.');
    cy.contains('Houve um erro ao criar um user, e-mail já cadastrado.').should('be.visible');
  });

  it('User visualize details', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy^="user-eye-"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);

      randomElement.trigger('click');

      cy.contains('Nome:').should('be.visible');
      cy.contains('E-mail').should('be.visible');
      cy.contains('Numero de telefone:').should('be.visible');
      cy.contains('Link do Linkedin').should('be.visible');
      cy.contains('Link do instagram:').should('be.visible');
      cy.contains('Link do Github:').should('be.visible');
      cy.contains('Link do Behance:').should('be.visible');
      cy.contains('Situação:').should('be.visible');
      cy.contains('Mini Bio:').should('be.visible');
      cy.contains('Data de criação:').should('be.visible');
      cy.get('[data-cy="user-show-details-close-button"]').click();
    });
  });

  it('User search for a user', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="type-user-name"]').click().type('Nome');
    cy.intercept('GET', '**/user**').as('searchUser');
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchUser');
    cy.contains('Nome').should('be.visible');
  });

  it('User edit a user', () => {
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy="type-user-name"]').click().type('Nome');
    cy.intercept('GET', '**/user**').as('searchUser');
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchUser');
    cy.get('[data-cy^="user-pencil-"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="user-name"]').find('input').type('{selectall}{backspace}').type(userName);
      cy.get('[data-cy="user-email"]').find('input').should('be.disabled');
      cy.intercept('PUT', '/user/*').as('postUser');
      cy.get('[data-cy="user-save"]').click();
      cy.wait('@postUser');
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Usuário atualizado!');
      const userElement = cy.get(`[data-cy^="user-row-${userName}"]`);
      userElement.within(() => {
        cy.contains('span', userName).should('be.visible');
      });
    });
  });

  it('User inactives bulk status correctly', () => {
    cy.bulkInactivesUser();
  });

  it('User activates bulk status correctly', () => {
    cy.bulkActivesUser();
  });

  it('User select a role', () => {
    cy.createRole(roleName);
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy^="user-pencil-"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="new-edit-role-selector-in-user"]')
        .type('{selectall}{backspace}')
        .click()
        .type(roleName);
      cy.get('body').click();
      cy.get('[data-cy="user-save"]').click({ force: true });
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Usuário atualizado!');
    });
  });

  it('User select a category', () => {
    cy.createCategory(categoryName, true);
    cy.get('[data-cy="nav-item-users"]').click();
    cy.get('[data-cy^="user-pencil-"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="category-selector-button"]').click();
      cy.get('[data-cy="category-selector-tree"]').within(()=> {
        cy.get(`data-cy="category-selector-${categoryName}"`).click();
      });
      cy.get('[data-cy="category-selector-tree-button"]').click();
      cy.get('[data-cy="user-save"]').click({ force: true });
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Usuário atualizado!');
    });
  });
});
