/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Tag', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  it('User doesnt type tag name', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="list-new-tag"]').click();
    cy.get('[data-cy="tag-color"]').click();
    cy.get('[data-cy="vermelho-color"]').click();
    cy.get('[data-cy="tag-save"]').click();
    cy.contains('Nome da tag é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User doesnt select tag color', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="list-new-tag"]').click();
    cy.get('[data-cy="tag-name"]').type('Video');
    cy.get('[data-cy="tag-save"]').click();
    cy.contains('Cor da tag é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User doesnt type tag name and doesnt select tag color', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="list-new-tag"]').click();
    cy.get('[data-cy="tag-save"]').click();
    cy.contains('Nome da tag é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
    cy.contains('Cor da tag é obrigatório')
      .should('be.visible')
      .should('have.css', 'color', 'rgb(255, 86, 48)');
  });

  it('User create correctly a tag', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="list-new-tag"]').click();
    cy.get('[data-cy="tag-name"]').type(`Tag-${Math.random()}`);
    cy.get('[data-cy="tag-color"]').click();
    cy.get('[data-cy="vermelho-color"]').click();
    cy.intercept('POST', '**/tag').as('postTag');
    cy.get('[data-cy="tag-save"]').click();
    cy.wait('@postTag');
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Nova tag criada!');
  });

  it('User tries to create a tag with the same name of another tag', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="list-new-tag"]').click();
    const tagName = `Tag-${Math.random()}`;
    cy.get('[data-cy="tag-name"]').type(tagName);
    cy.get('[data-cy="tag-color"]').click();
    cy.get('[data-cy="vermelho-color"]').click();
    cy.intercept('POST', '**/tag').as('postTag');
    cy.get('[data-cy="tag-save"]').click();
    cy.wait('@postTag');
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Nova tag criada!');
    cy.get('[data-cy="list-new-tag"]').click();
    cy.get('[data-cy="tag-name"]').type(tagName);
    cy.get('[data-cy="tag-color"]').click();
    cy.get('[data-cy="azul-color"]').click();
    cy.get('[data-cy="tag-save"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Essa Tag já existe.');
  });

  it('User activates bulk status correctly', () => {
    cy.bulkActives();
  });

  it('User inactives bulk status correctly', () => {
    cy.bulkInactives();
  });

  it('User show details', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy^="tag-eye-tag_"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);

      randomElement.trigger('click');

      cy.contains('Nome:').should('be.visible');
      cy.contains('Cor:').should('be.visible');
      cy.contains('Situação:').should('be.visible');
      cy.contains('Data de criação:').should('be.visible');

      cy.get('[data-cy="tag-close-details"]').click();
    });
  });

  it('User do a color quick edit', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy^="tag-pencil-tag_"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy="tag-name"]').find('input').should('be.disabled');
      cy.get('[data-cy="tag-color"]').click();
      cy.get('[data-cy="azul-color"]').click();
      cy.intercept('PUT', '**/tag/**').as('putTag');
      cy.get('[data-cy="tag-save"]').click();
      cy.wait('@putTag');
      cy.wrap(randomElement)
        .parents('[data-cy^="tag-row-tag_"]') // Encontra o pai que corresponde ao seletor
        .then(($row) => {
          cy.wrap($row)
            .find('[data-cy="tag-label-name"]')
            .then(($relatedElement) => {
              const color = $relatedElement.css('color');
              cy.wrap($relatedElement).should('have.css', 'color', color);
            });
        });
    });
  });

  it('User do a tag quick edit', () => {
    cy.tagQuickEdit();
  });

  it('User delete a tag', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy^="tag-options-tag_"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      const dataCyValue = randomElement.attr('data-cy');
      if (dataCyValue) {
        const parts = dataCyValue.split('_');
        if (parts.length > 0) {
          const uniquePart = parts[parts.length - 1];
          cy.get(`[data-cy="tag-delete-tag_${uniquePart}"]`).click();
          cy.get('[data-cy="tag-delete"]').click();
        }
        cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Tag deletada!');
      }
    });
  });

  it('User search for a tag', () => {
    const tagName = faker.animal.type();
    cy.createTag(tagName);
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy="type-tag-search"]').type(tagName);
    cy.get('[data-cy="results-filter"]').should('not.exist');
    cy.intercept('GET', '**/tag**').as('searchTag');
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchTag');
    cy.get('[data-cy="results-filter"]').should('be.visible').within(() => {
      cy.get('[data-cy="search_filter_label"]').find('span').should('have.text', tagName);
    });
    cy.get('[data-cy="tag-label-name"]').first().within(() => {
      cy.get('p').should('have.text',tagName);
    });
  });

  it('User edit a tag', () => {
    cy.get('[data-cy="nav-item-tags"]').click();
    cy.get('[data-cy^="tag-options-tag_"]').then(($elements) => {
      const randomIndex = Math.floor(Math.random() * $elements.length);
      const randomElement = $elements.eq(randomIndex);
      randomElement.trigger('click');
      cy.get('[data-cy^="tag-edit-tag_"]').click();
      // TODO - Adicionar Data-Cy
      cy.get('[data-cy="tag-name"]').find('input').should('be.disabled');
      cy.get('[data-cy="tag-color"]').click();
      cy.get('[data-cy="azul-color"]').click();
      cy.get('[data-cy="tag-active"]').click();
      cy.get('[data-cy="ativo-status"]').click();
      cy.get('[data-cy="tag-save"]').click();
      cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Tag atualizada!');
    });
  });
});
