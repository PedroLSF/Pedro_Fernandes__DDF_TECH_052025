/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Content', () => {
  let channelName: string;
  let channelDesc: string;
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    channelName = faker.person.firstName();
    channelDesc = faker.lorem.lines(1);
    cy.visit('/dashboard');
  });

  it('User create a public channel without a thumb', () => {
    cy.createChannel(channelName, channelDesc);
  });

  it('User create a private channel without a thumb', () => {
    cy.createChannel(channelName, channelDesc, 'meudominio.com');
  });

  it('User create a public channel with a thumb', () => {
    cy.createChannel(channelName, channelDesc, undefined, 'cypress/fixture/image.jpg');
  });

  it('User see a table channel', () => {
    cy.createChannel(channelName, channelDesc, undefined, 'cypress/fixture/image.jpg');
    cy.get('[data-cy="nav-item-channels"]').click();

    cy.get('[data-cy="table-sort-type"]').should('be.visible').should('have.text', 'Tipo');
    cy.get('[data-cy="table-sort-active"]').should('have.text', 'Situação');
    cy.get('[data-cy="table-sort-videoChannels._count"]')
      .should('be.visible')
      .should('have.text', 'Vídeos totais');
    cy.get('[data-cy="table-sort-created_at"]')
      .should('be.visible')
      .should('have.text', 'Data de Criação');
    cy.get('[data-cy="table-sort-updated_at"]')
      .should('be.visible')
      .should('have.text', 'Atualizado em');
  });

  it('user search for a channel', () => {
    cy.createChannel(channelName, channelDesc);
    cy.get('[data-cy="nav-item-channels"]').click();
    cy.get('[data-cy="type-channel-search"]').type(channelName);
    cy.get('[data-cy="results-filter"]').should('not.exist');
    cy.intercept('GET', '**/channel?**').as('searchChannel');
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchChannel');
    cy.get('[data-cy="results-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy="search_filter_label"]').find('span').should('have.text', channelName);
      });
    cy.get('[data-cy^="channel-row-cha_"]')
      .first()
      .within(() => {
        cy.get('p').should('have.text', channelName);
      });
  });

  it('User inactives bulk status correctly', () => {
    cy.createChannel(channelName, channelDesc);
    cy.bulkInactivesChannel();
  });

  it('User actives bulk status correctly', () => {
    cy.createChannel(channelName, channelDesc);
    cy.bulkActivesChannel();
  });

  // it('User does a channel quick edit', () => {
  // TODO: FIX
  //   cy.channelQuickEdit(`${faker.person.firstName()}`);
  // });

  it('User deletes a channel', () => {
    cy.createChannel(channelName, channelDesc);
    cy.get('[data-cy="nav-item-channels"]').click();
    cy.get('[data-cy^="channel-options-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      cy.get('[data-cy="type-channel-search"]').type(channelName);
      cy.get('[data-cy="search-button"]').click();
      cy.get(`[data-cy="channel-options-${channelName}"]`).scrollIntoView().click();
      cy.intercept('DELETE', '**/channel/**').as('deleteChannel');
      cy.get(`[data-cy="channel-option-delete-${channelName}"]`).click();
      cy.get('[data-cy="confirm-delete"]').click();
      cy.wait('@deleteChannel').then((interception) => {
        expect(interception.request.url).to.include('cha_');
        expect(interception.request.method).to.equal('DELETE');
        expect(interception.response?.statusCode).to.equal(200);
      });
      cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Canal deletado!');
    });
  });
});
