/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Entity', () => {
  let directoryName: string;
  let categoryName: string;
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
    directoryName = faker.person.firstName();
    categoryName = faker.person.firstName();
  });

  it('User visualize raw content in an entity', () => {
    cy.createDirectories(categoryName, directoryName);
    cy.createRawVideo(directoryName);
    cy.get('.go703367398 > .MuiButtonBase-root').click();
    cy.get('[data-cy="entity-button"]').click();
    cy.get(`[data-cy="entity-${categoryName}"]`);
    cy.reload();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.get('[data-cy^="video-vid_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('div').eq(1).find('div').should('contain.text', `${directoryName}, ${categoryName}`);
      });
  });

  it('User visualize content in an entity', () => {
    cy.createDirectories(categoryName, directoryName);
    cy.createContent(directoryName);
    cy.get('.go703367398 > .MuiButtonBase-root').click();
    cy.get('[data-cy="entity-button"]').click();
    cy.get(`[data-cy="entity-${categoryName}"]`);
    cy.reload();
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('div').eq(1).find('div').should('contain.text', `${directoryName}, ${categoryName}`);
      });
  });

  it('User visualize category in an entity', () => {
    cy.createDirectories(categoryName, directoryName);
    cy.get('.go703367398 > .MuiButtonBase-root').click();
    cy.get('[data-cy="entity-button"]').click();
    cy.get(`[data-cy="entity-${categoryName}"]`);
    cy.reload();
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy^="category-tree-"]')
      .first()
      .within(() => {
        cy.get('div').eq(2).should('contain.text', `${categoryName}`);
      });
  });
});
