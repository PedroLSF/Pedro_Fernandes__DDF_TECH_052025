/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Role', () => {
  let roleName: string;
  let userName: string;
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    roleName = faker.person.firstName();
    userName = faker.person.fullName();
    cy.visit('/dashboard');
  });

  it('User create a role', () => {
    cy.createRole(roleName);
    cy.contains('Nova função criada!').should('be.visible');
  });

  it('User checks permissions', () => {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.createRole(roleName);
    cy.get(`[data-cy="role-options-${roleName}"]`).click();
    cy.get(`[data-cy="role-edit-${roleName}"]`).click();
    cy.get('[data-cy="role-tab-permission"]').click();
    cy.get('input[type="checkbox"]').should('have.length.gte', 1);
    cy.get('[data-cy="raw-videos-view-raw-videos"]').click();
    cy.get('[data-cy="raw-videos-view-raw-videos"]').find('input').should('be.checked');
  });

  it('User doesnt type role name', () => {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.get('[data-cy="list-new-role"]').click();
    cy.get('[data-cy="role-button"]').click();
    cy.contains('Nome é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User inactives bulk status correctly', () => {
    cy.bulkInactivesrole();
  });

  it('User activates bulk status correctly', () => {
    cy.bulkActivesrole();
  });

  it('User visualize details', () => {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.createRole(roleName);
    cy.get(`[data-cy="role-eye-${roleName}"]`).click();
    cy.contains('Nome:').should('be.visible');
    cy.contains('Descrição').should('be.visible');
    cy.contains('Situação:').should('be.visible');
    cy.contains('Admin:').should('be.visible');
    cy.contains('Data de criação:').should('be.visible');
    cy.get('[data-cy="role-details-button"]').click();
  });

  it('User do a name quick edit', () => {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.createRole(roleName);
    cy.get(`[data-cy^="role-pencil-${roleName}"]`).click();
    const roleEdit = `Função-${Math.random()}`;
    cy.get('[data-cy="role-quick-name"]')
      .find('input')
      .type('{selectall}{backspace}')
      .type(roleEdit);
    cy.get('[data-cy="role-quick-save-button"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
    cy.get(`[data-cy="role-active-${roleEdit}"]`).should('have.text', roleEdit);
  });

  it('User deletes a role sucessfully', () => {
    cy.createRole(roleName);
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.intercept('GET', '**/role**').as('searchRole');
    cy.get('[data-cy="type-role-search"]').type(roleName);
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchRole');
    cy.get(`[data-cy="role-options-${roleName}"]`).click();
    cy.get(`[data-cy="role-delete-${roleName}"]`).click();
    cy.intercept('DELETE', '**/role/**').as('deleteRole');
    cy.get('[data-cy="role-delete"]').click();
    cy.wait('@deleteRole').then((interception) => {
      expect(interception.request.url).to.include('role');
      expect(interception.request.method).to.equal('DELETE');
      expect(interception.response?.statusCode).to.equal(200);
    });
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Função deletada!');
  });

  it('User tries to delete a role associated with users', () => {
    cy.createRole(roleName, false);
    cy.createUser(userName, `${roleName}@gmail.com`);
    cy.intercept('GET', '**/user**').as('searchUser');
    cy.get('[data-cy="type-user-name"]').type(userName);
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchUser');
    cy.get(`[data-cy="user-options-${userName}"]`).click();
    cy.get('.MuiPopover-root > .MuiPaper-root')
      .find('li')
      .should('have.length', 1)
      .and('contain.text', 'Editar');
  });

  it('User tries to delete a role with permissions', () => {
    cy.createRole(roleName, true);
    cy.intercept('GET', '**/role**').as('searchRole');
    cy.get('[data-cy="type-role-search"]').type(roleName);
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchRole');
    cy.get(`[data-cy="role-options-${roleName}"]`).click();
    cy.get(`[data-cy="role-delete-${roleName}"]`).click();
    cy.intercept('DELETE', '**/role/**').as('deleteRole');
    cy.get('[data-cy="role-delete"]').click();
    cy.wait('@deleteRole').then((interception) => {
      expect(interception.request.url).to.include('role');
      expect(interception.request.method).to.equal('DELETE');
      expect(interception.response?.statusCode).to.equal(500);
    });
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Erro ao excluir Função.');
  });
});
