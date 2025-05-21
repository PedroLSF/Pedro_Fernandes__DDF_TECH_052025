/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

describe('Content', () => {
  let currentDate: Date;
  let contentDate: string;
  let categoryName: string;

  beforeEach(() => {
    categoryName = faker.person.fullName();
    currentDate = new Date();
    contentDate = format(currentDate, 'dd/MM/yyyy');
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('User upload a content video', () => {
    cy.createContent(categoryName);
  });

  it('user sees video preview', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.contains('Prévia').click();
    cy.get('#video-preview').should('be.visible');
  });

  it('user sees their contents', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="created-by"]').find('input').check();
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy="filter_created_by"]').should('be.visible');
    cy.get('[data-cy^="view-content-details-vid_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('p').should('contain.text', 'raw-video-content.mp4');
        cy.get('td').eq(3).find('p').eq(1).should('contain.text', contentDate);
      });
  });

  it('user visualize details page', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]').first().click();
    cy.contains('Editar detalhes do conteúdo').should('be.visible');
  });

  it('user visualize video historic on the details page', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.contains('Prévia').click();
    cy.get('#video-preview').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy^="view-content-details-vid_"]').first().click();
    cy.get('[data-cy="video-historic"]').click();
    cy.get('[data-cy^="dialog-action-log-videos-act_log_"]')
      .first()
      .should('contain.text', `visualizou a prévia de um video`);

    cy.get('[data-cy^="dialog-box-createdAt-log-videos-act_log_"]')
      .first()
      .should('contain.text', `${contentDate}`);
  });

  it.skip('user bulk status on the details page', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]').first().click();
    cy.get('[data-cy="content-video-active"]').click();
  });

  it('user sees preview video on details page', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]').first().click();
    cy.get('[data-cy="content-video-preview-button"]').click();
    cy.get('#video-preview').should('be.visible');
  });

  it('user edit a content on details page', () => {
    cy.createCategory(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]').first().click();
    cy.get('[data-cy="content-video-description"]').type('Descrição');
    cy.get('[data-cy="dialog-box-log-videos-save"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain', 'video atualizado!');
  });

  it('user changes thumbnail on the edit page', () => {
    cy.createContent(categoryName);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="type-content-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy^="view-content-details-vid_"]')
      .first()
      .click()
      .then(($elements) => {
        const totalElements = $elements.length;
        if (totalElements < 1) {
          throw new Error('Element not found');
        }
        const randomIndex = Math.floor(Math.random() * totalElements);
        const randomElement = $elements.eq(randomIndex);
        randomElement.trigger('click');
        cy.get('[data-cy="content-video-change-thumb"]').click();
        cy.intercept('PUT', '**/tag**').as('getImage');
        cy.intercept('PUT', '**/images/*').as('uploadImage');
        cy.get('[data-cy="image-upload"]').selectFile('cypress/fixture/thumbnail.png', {
          action: 'drag-drop',
        });
        cy.wait('@uploadImage');
        cy.get('[data-cy="upload-image-content-save"]').click();
        cy.get('#notistack-snackbar')
          .should('be.visible')
          .should('contain.text', 'Video atualizado!');
      });
  });
});
