/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

describe('Logs', () => {
  let currentDate: Date;
  let logDate: string;
  let categoryName: string;
  let channelName: string;
  let channelDesc: string;
  let tagName: string;
  let roleName: string;
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
    currentDate = new Date();
    logDate = format(currentDate, 'dd/MM/yyyy');
    categoryName = faker.person.firstName();
    channelName = faker.person.firstName();
    channelDesc = faker.lorem.lines(1);
    tagName = `Tag-${Math.random()}`;
    roleName = `Função-${Math.random()}`;
  });

  it('User upload a raw video and sees log', () => {
    cy.createRawVideo();
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Upload');
        cy.get('td')
          .eq(4)
          .find('span')
          .should('contain.text', 'fez upload de um video com sucesso');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it.skip('User download a raw video and sees log', () => {
    cy.get('[data-cy="nav-item-raw-content"]').click();
    cy.get('[data-cy^="raw-video-checkbox-vid_"]').first().click();
    cy.intercept('POST', '**/video/request-download/**').as('downloadRawVideo');
    cy.get('[data-cy="raw-content-download-all-selected"]').click();
    cy.wait('@downloadRawVideo').then((interception) => {
      expect(interception.state).to.be.equal('Complete');
    });
    cy.get('body').click();
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(4).find('span').should('contain.text', 'fez download de um video');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User sees raw video preview and sees log', () => {
    cy.get('[data-cy="nav-item-raw-content"]').click();
    cy.intercept('POST', '**/video/**').as('watchVideos');
    cy.get('[data-cy^="raw-video-preview-vid_"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.wait('@watchVideos');
      cy.get('[data-cy="video-preview-close-button"]').click();
    });
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Prévia de vídeo');
        cy.get('td').eq(4).find('span').should('contain.text', 'visualizou a prévia de um video');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User create a category and sees log', () => {
    cy.createCategory(categoryName);
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(4).find('span').should('contain.text', ' criou uma categoria');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User deletes category and sees log', () => {
    cy.createCategory(categoryName);
    cy.wait(1500);
    cy.deleteCategory();
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Exclusão');
        cy.get('td').eq(4).find('span').should('contain.text', 'excluiu uma categoria');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User create a channel and sees log', () => {
    cy.createChannel(channelName, channelDesc);
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy="filters-log-Criação"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Criação');
        cy.get('td').eq(4).find('span').should('contain.text', 'criou um canal');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  // TODO: FIX
  // it('User edit a channel and sees log', () => {
  //   cy.channelQuickEdit(channelName);
  //   cy.get('[data-cy="nav-item-logs"]').click();
  //   cy.get('[data-cy^="logs-row-act_log_"]')
  //     .first()
  //     .within(() => {
  //       cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
  //       cy.get('td').eq(3).find('span').should('contain.text', 'Atualização');
  //       cy.get('td').eq(4).find('span').should('contain.text', 'atualizou um canal');
  //       cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
  //     });
  // });

  it('User create a tag and sees log', () => {
    cy.createTag(tagName);
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Criação');
        cy.get('td').eq(4).find('span').should('contain.text', 'criou uma tag');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User edit a tag and sees log', () => {
    cy.tagQuickEdit();
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Atualização');
        cy.get('td').eq(4).find('span').should('contain.text', 'atualizou uma tag');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User deletes a tag and sees log', () => {
    cy.createTag(tagName);
    cy.wait(1000);
    cy.deleteTag();
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Exclusão');
        cy.get('td').eq(4).find('span').should('contain.text', 'excluiu uma tag');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User create a role and sees log', () => {
    cy.createRole(roleName);
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Criação');
        cy.get('td').eq(4).find('span').should('contain.text', 'criou uma função');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User deletes a role and sees log', () => {
    cy.createRole(roleName);
    cy.wait(1000);
    cy.deleteRole(roleName);
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Exclusão');
        cy.get('td').eq(4).find('span').should('contain.text', 'excluiu uma função');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User sign in and sees log', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.contains('Sair').click();

    cy.get('[data-cy="login-email"]').type(Cypress.env('user_name'));
    cy.get('[data-cy="login-password"]').type(Cypress.env('user_password'), { log: false });
    cy.get('[data-cy="login-enter"]').click();
    cy.contains('Olá! Bem-vindo(a) de volta,').should('be.visible');

    cy.get('[data-cy="nav-item-logs"]').click();
    cy.get('[data-cy^="logs-row-act_log_"]')
      .first()
      .within(() => {
        cy.get('td').eq(2).find('span').should('contain.text', Cypress.env('user_name'));
        cy.get('td').eq(3).find('span').should('contain.text', 'Entrar');
        cy.get('td').eq(4).find('span').should('contain.text', 'entrou com sucesso na aplicação');
        cy.get('td').eq(5).find('span').eq(0).should('contain.text', logDate);
      });
  });

  it('User uses a filter to see logs', () => {
    cy.get('[data-cy="nav-item-logs"]').click();
    cy.intercept('GET', '**/activity-log**').as('filterLog');
    cy.get('[data-cy="filters-log-Criação"]').click();
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@filterLog');
    cy.get('[data-cy="results-filter"]').should('be.visible');
  });
});
