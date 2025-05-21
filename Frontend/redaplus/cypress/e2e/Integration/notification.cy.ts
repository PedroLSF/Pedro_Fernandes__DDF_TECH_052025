/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
const notificationOptions = [
  'Novo vídeo',
  'Vídeo Editado',
  'Novo Canal',
  'Canal Editado',
  'Enviar por Email',
  'Nova legenda',
];

describe('Notification', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('User receives notification after upload a video', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="user-submenu-option-notifications"]').click();

    notificationOptions.forEach((option) => {
      cy.get(`[data-cy="general-notifications-switch-${option}"]`)
        .find('input')
        .then(($checkbox) => {
          if (!$checkbox.prop('checked')) {
            cy.get(`[data-cy="general-notifications-switch-${option}"]`).click();
          }
        });
    });

    cy.get('[data-cy="user-notifications-save"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Atualizado com sucesso!');
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.get('[data-cy="upload-raw-video-button"]').click();
    cy.wait(500);
    cy.createRawVideo();
    cy.get('[data-cy="notification-popover-bell"]', { timeout: 6000 }).click({ force: true });
    cy.get('[data-cy="notification-Novo vídeo"]').first().should('be.visible');
    cy.get('[data-cy="notification-video-title-raw-video-content.mp4"]')
      .first()
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.include('raw-video-content.mp4');
      });
  });

  it.skip('User receives notification after edit a video', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="user-submenu-option-notifications"]').click();

    notificationOptions.forEach((option) => {
      cy.get(`[data-cy="general-notifications-switch-${option}"]`)
        .find('input')
        .then(($checkbox) => {
          if (!$checkbox.prop('checked')) {
            cy.get(`[data-cy="general-notifications-switch-${option}"]`).click();
          }
        });
    });

    cy.get('[data-cy="user-notifications-save"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Atualizado com sucesso!');
    cy.get('[data-cy="nav-item-raw-content"]').click();
    cy.get('[data-cy="upload-raw-video-button"]').click();
    cy.wait(500);
    const newName = faker.person.firstName();
    cy.createRawVideo();
    cy.get('[data-cy="type-channel-search"]').type('raw-video-content.mp4');
    cy.get('[data-cy="search-button"]').click();
    cy.rawVideoQuickEdit(newName);
    cy.get('[data-cy="notification-popover-bell"]', { timeout: 6000 }).click({ force: true });
    cy.get('.MuiList-root > :nth-child(1)').within(() => {
      cy.contains('Video Editado').should('be.visible');
    });
  });

  it('User receives notification after create a channel', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="user-submenu-option-notifications"]').click();
    cy.get('[data-cy="general-notifications-switch-Novo Canal"]')
      .find('input')
      .then(($checkbox) => {
        if (!$checkbox.prop('checked')) {
          cy.get('[data-cy="general-notifications-switch-Novo Canal"]').click();
          cy.get('[data-cy="user-notifications-save"]').click();
          cy.get('#notistack-snackbar')
            .should('be.visible')
            .should('contain.text', 'Atualizado com sucesso!');
        }
      });
    const channelName = faker.person.firstName();
    const channelDesc = faker.lorem.lines(1);
    cy.createChannel(channelName, channelDesc);
    cy.wait(500);
    cy.get('[data-cy="notification-popover-bell"]', { timeout: 6000 }).click({ force: true });
    cy.get('[data-cy="notification-Novo Canal"]')
      .first()
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.include('Novo Canal');
      });
  });

  it('User receives notification after edit a channel', () => {
    cy.get('[data-cy="account-popover"]').click();
    cy.get('[data-cy="option-Perfil"]').click();
    cy.get('[data-cy="user-submenu-option-notifications"]').click();
    cy.get('[data-cy="general-notifications-switch-Canal Editado"]')
      .find('input')
      .then(($checkbox) => {
        if (!$checkbox.prop('checked')) {
          cy.get('[data-cy="general-notifications-switch-Canal Editado"]').click();
          cy.get('[data-cy="user-notifications-save"]').click();
          cy.get('#notistack-snackbar')
            .should('be.visible')
            .should('contain.text', 'Atualizado com sucesso!');
        }
      });
    const channelName = faker.person.firstName();
    const channelDesc = faker.lorem.lines(1);
    cy.createChannel(channelName, channelDesc);
    const newName = faker.person.firstName();
    cy.channelQuickEdit(newName, channelName);
    cy.get('[data-cy="notification-popover-bell"]', { timeout: 6000 }).click({ force: true });
    cy.get('[data-cy="notification-Canal Editado"]')
      .first()
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.include('Canal Editado');
      });
  });
});
