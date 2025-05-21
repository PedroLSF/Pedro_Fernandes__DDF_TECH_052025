/// <reference types="cypress" />

describe('Menu', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });
  it('User views menu items', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Dashboard').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('be.visible');
      cy.contains('Gerenciamento').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('be.visible');
      cy.get('[data-cy="nav-item-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('be.visible');
      cy.contains('Configurações').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('be.visible');
      cy.contains('Usuários').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('be.visible');
      cy.contains('Relatórios').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('be.visible');
    });
  });

  it('User clicks on Dashboard', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Dashboard').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('not.be.visible');
      cy.contains('Gerenciamento').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('be.visible');
      cy.get('[data-cy="nav-item-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('be.visible');
      cy.contains('Configurações').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('be.visible');
      cy.contains('Usuários').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('be.visible');
      cy.contains('Relatórios').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('be.visible');
      cy.contains('Dashboard').click(); // TODO - adicionar data-cy
    });
  });

  it('User clicks on Gerenciamento', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Gerenciamento').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-content"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('not.be.visible');
      cy.contains('Dashboard').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('be.visible');
      cy.contains('Configurações').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('be.visible');
      cy.contains('Usuários').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('be.visible');
      cy.contains('Relatórios').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('be.visible');
      cy.contains('Gerenciamento').click(); // TODO - adicionar data-cy
    });
  });

  it('User clicks on Configurações', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Configurações').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('not.be.visible');
      cy.contains('Dashboard').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('be.visible');
      cy.contains('Gerenciamento').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('be.visible');
      cy.get('[data-cy="nav-item-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('be.visible');
      cy.contains('Usuários').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('be.visible');
      cy.contains('Relatórios').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('be.visible');
      cy.contains('Configurações').click(); // TODO - adicionar data-cy
    });
  });

  it('User clicks on Usuários', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Usuários').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('not.be.visible');
      cy.contains('Dashboard').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('be.visible');
      cy.contains('Gerenciamento').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('be.visible');
      cy.get('[data-cy="nav-item-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('be.visible');
      cy.contains('Configurações').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('be.visible');
      cy.contains('Relatórios').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('be.visible');
      cy.contains('Usuários').click(); // TODO - adicionar data-cy
    });
  });

  it('User clicks on Relatórios', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Relatórios').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('not.be.visible');
      cy.contains('Dashboard').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('be.visible');
      cy.contains('Gerenciamento').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('be.visible');
      cy.get('[data-cy="nav-item-content"]').should('be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('be.visible');
      cy.contains('Configurações').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('be.visible');
      cy.contains('Usuários').should('be.visible'); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('be.visible');
      cy.contains('Relatórios').click(); // TODO - adicionar data-cy
    });
  });

  it('User clicks on all elements', () => {
    cy.get('[data-cy="vertical-sidebar"]').within(() => {
      cy.contains('Dashboard').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-statistics"]').should('not.be.visible');
      cy.contains('Gerenciamento').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-raw-content"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-my-list"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-content"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-channels"]').should('not.be.visible');
      cy.contains('Configurações').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-tags"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-categories"]').should('not.be.visible');
      cy.contains('Usuários').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-users"]').should('not.be.visible');
      cy.get('[data-cy="nav-item-roles"]').should('not.be.visible');
      cy.contains('Relatórios').click(); // TODO - adicionar data-cy
      cy.get('[data-cy="nav-item-logs"]').should('not.be.visible');
    });
  });
});
