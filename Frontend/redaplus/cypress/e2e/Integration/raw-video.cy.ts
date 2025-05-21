/// <reference types="cypress" />

import { format } from 'date-fns';
import { faker } from '@faker-js/faker';

describe('Raw Video', () => {
  let currentDate: Date;
  let rawVideoDate: string;
  let previewVideoDate: string;
  let categoryName: string;
  let directoryName: string;

  beforeEach(() => {
    directoryName = faker.person.fullName();
    categoryName = faker.person.fullName();
    currentDate = new Date();
    rawVideoDate = format(currentDate, 'dd/MM/yyyy HH:mm');
    previewVideoDate = format(currentDate, 'dd/MM/yyyy - HH:mm')
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('user upload raw video', () => {
    cy.createDirectories(directoryName, categoryName);
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.intercept('GET', '**/upload-content/**').as('loadPage');
    cy.get('[data-cy="upload-raw-video-button"]').click();
    cy.wait('@loadPage');
    cy.wait(2000);
    cy.get('[data-cy="category-selector-button"]').click();
    cy.get('[data-cy="category-selector-tree"]')
      .find('[data-cy^="category-selector-"]')
      .find('[data-disabled]')
      .filter('[data-disabled="false"]')
      .last()
      .click();
    cy.get('[data-cy="category-selector-tree-button"]').click();

    cy.get('[data-cy="upload-video-drawer"]').selectFile('cypress/fixture/raw-video-content.mp4', {
        action: 'drag-drop',
    });
    cy.intercept('PUT', '**/videos/**').as('upload');
    cy.get('[data-cy="upload-video-button"]').click();
    cy.wait('@upload');
    cy.get('.swal2-confirm').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'raw-video-content.mp4 carregado!');
    cy.get('[data-cy="nav-item-raw-content"]').click();
    cy.get('[data-cy="video-row-name-raw-video-content.mp4"]').should('be.visible');
  });

  it('user search a raw video by directory', () => {
    cy.createDirectories(directoryName, categoryName);
    cy.createRawVideo(categoryName);
    cy.reload();
    cy.intercept('GET', '**/category/**').as('loadPage');
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.wait('@loadPage');
    cy.wait(2000);
    cy.get('[data-cy="category-selector"]')
      .find('[data-cy="category-selector-button"]')
      .click();
    cy.get(
      '.css-1ftsfft > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content'
    ).within(() => {
      // TO-DO: Adicionar data-cy
      cy.contains(`${categoryName}`).scrollIntoView().click();
    });
    cy.get('[data-cy="category-selector-tree-button"]').click();
    cy.intercept('GET', '**/category/**').as('searchRawVideo')
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchRawVideo');
    cy.get('[data-cy="category-selection-value"]')
      .find('input')
      .should('have.value', `/${directoryName}/${categoryName}`);
    cy.get('[data-cy^="video-vid_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('div').eq(1).find('div').should('contain.text', `${directoryName}, ${categoryName}`);
      });
  });

  it('user tries to download a raw video', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.get('[data-cy^="video-row-name-"]').first().click();
    cy.intercept('POST', '**/video/request-download/**').as('downloadRawVideo');
    cy.get('[data-cy="video-download-button"]').click();
    cy.wait('@downloadRawVideo').then((interception) => {
      expect(interception.state).to.be.equal('Complete');
    });
  });

  it('user sees their videos', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.reload();
    cy.get('[data-cy="created-by-filter"]').find('input').check();
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy="created-by-filter"]').find('input').should('be.checked');
    cy.get('[data-cy^="video-vid_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('p').should('contain.text', 'raw-video-content.mp4');
        cy.get('td').eq(3).find('p').eq(1).should('contain.text', rawVideoDate);
      });
  });

  it('user tries to download selected raw videos', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.intercept('POST', '**/video/request-download/**').as('downloadRawVideo');
    cy.get('[data-cy^="video-vid_"]').then(($elements) => {
      let elements = $elements.length;
      while (elements <= 3) {
        cy.createRawVideo();
        elements += 1;
      }
    });
    cy.get('[data-cy^="raw-video-checkbox-vid_"]').then(($elements) => {
      const totalElements = $elements.length;
      const indices = new Set();

      while (indices.size < 3) {
        const randomIndex = Math.floor(Math.random() * totalElements);
        indices.add(randomIndex);
      }

      indices.forEach((index) => {
        const randomElement = $elements.eq(index as number);
        cy.log(`${randomElement}`);
        cy.wrap(randomElement).trigger('click');
      });
      cy.get('[data-cy="raw-content-download-all-selected"]').click();
      cy.wait(['@downloadRawVideo', '@downloadRawVideo', '@downloadRawVideo']).then(
        (interceptions) => {
          expect(interceptions).to.have.length(3);
          interceptions.forEach((interception) => {
            expect(interception.state).to.be.equal('Complete');
          });
        }
      );
    });
  });

  it('user bulk status on the details page', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.get('[data-cy="active_tab"]').click();
    cy.get('[data-cy^="video-row-name-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="raw-video-active"]').click();
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Situação atualizada!');
      cy.get('[data-cy="all_tab"]').click();
      const videoElement = cy.get(`[data-cy^="video-vid_"]`).eq(randomIndex);
      videoElement.within(() => {
        cy.contains('td', 'Inativo').should('be.visible');
      });
    });
  });

  it('user views raw video historic on the details page', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });

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
      cy.get(`[data-cy^="video-vid_"]`).eq(randomIndex).click();
      cy.get('[data-cy="video-historic"]').click();
      cy.get('[data-cy^="log-videos-act_log_"]')
        .first()
        .within(() => {
          cy.get('[data-cy^="dialog-box-log-videos-act_log_"] > .MuiStack-root')
            .find('div').eq(1)
            .should(
            'contain.text',
            `${previewVideoDate}`
          );
          cy.get(`[data-cy^="action-log-videos-act_lo_"]`).should(
            'contain.text',
            `visualizou a prévia de um video`
          );
        });
    });
  });

  it('user deletes a raw video', () => {
    cy.createRawVideo();
    cy.get('body').then($body => {
      if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      } else {
        cy.get('[data-cy="nav-item-raw-content"]').click();
        cy.get('[data-cy="nav-item-raw-content-list"]').click();
      }
    });
    cy.get('[data-cy^="video-row-name-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="raw-video-delete-button"]').click();
      cy.intercept('DELETE', '**/video/**').as('deleteVideos');
      cy.get('[data-cy="confirm-delete"]').click();
      cy.wait('@deleteVideos').then((interception) => {
        expect(interception.request.url).to.include('video');
        expect(interception.request.method).to.equal('DELETE');
        expect(interception.response?.statusCode).to.equal(200);
      });
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Video excluído com sucesso');
    });
  });

  it('User inactives bulk status correctly', () => {
    cy.createRawVideo();
    cy.bulkInactivesRawVideo();
  });

  it('User activates bulk status correctly', () => {
    cy.createRawVideo();
    cy.bulkActivesRawVideo();
  });

  it('User does a quick edit', () => {
    const categoryEdit = faker.animal.type();
    cy.createRawVideo();
    cy.createCategory(categoryEdit);
    cy.rawVideoQuickEdit('newName', categoryEdit);
  });

  it('User deletes selected raw videos', () => {
    cy.deleteRawVideo();
  });
});
