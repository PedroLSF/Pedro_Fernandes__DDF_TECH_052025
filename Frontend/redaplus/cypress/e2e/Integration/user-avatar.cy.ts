/// <reference types="cypress" />

describe('User avatar', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('user upload avatar', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="avatar-upload"]').click();
    cy.get('[data-cy="avatar-upload"]').selectFile('cypress/fixture/image.jpg', {
      action: 'drag-drop',
    });
    cy.intercept('PUT', '**/images/*').as('upload');
    cy.wait('@upload');
    cy.get('[data-cy="user-save"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Usuário atualizado!');
  });

  it('user delete avatar', () => {
    cy.get('.MuiAvatar-img').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="avatar-upload"]').click();
    cy.get('[data-cy="avatar-upload"]').selectFile('cypress/fixture/image.jpg', {
      action: 'drag-drop',
    });
    cy.intercept('PUT', '**/images/*').as('upload');
    cy.wait('@upload');
    cy.get('[data-cy="user-save"]').click();
    cy.get('[data-cy="account-popover"]').click({ timeout: 7000 });
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="delete-avatar-iconbutton"]').click();
    cy.get('[data-cy="user-general-delete"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Usuário atualizado!');
    cy.get('[data-cy="avatar-upload"]').find('span').should('contain.text', 'Adicionar Foto');
  });
});
