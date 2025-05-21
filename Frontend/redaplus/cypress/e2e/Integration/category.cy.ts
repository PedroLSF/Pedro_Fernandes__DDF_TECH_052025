/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Category', () => {
  let categoryName: string;
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
    categoryName = faker.person.firstName();
  });

  it('user create a category what is entity', () => {
    cy.createCategory(categoryName, true);
    cy.get('#notistack-snackbar').should('be.visible');
    cy.contains('Nova categoria criada!').should('be.visible');
  });

  it('user create a category what is not entity', () => {
    cy.createCategory(categoryName);
    cy.get('#notistack-snackbar').should('be.visible');
    cy.contains('Nova categoria criada!').should('be.visible');
  });

  it('user try to create a category what is not entity and fail', () => {
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy="new-category-create"]').click();
    cy.get('[data-cy="category-name-new-edit"]').type(categoryName);
    cy.get('[data-cy="save-button-new-edit"]').click();
    cy.get('#notistack-snackbar').should('be.visible');
    cy.contains('Agrupamento inválido para categoria.').should('be.visible');
  });

  it('user visualize category details', () => {
    cy.createCategory(categoryName);
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy="tab-category-table"]').click();
    cy.get('[data-cy^="category-show-details-button-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      cy.wrap(randomElement).trigger('click');
      const dataCyValue = randomElement.attr('data-cy');
      if (!dataCyValue) {
        throw new Error('Element not found');
      }
      const parts = dataCyValue.split('-');
      if (parts.length < 0) {
        throw new Error();
      }
      const uniquePart = parts.slice(-1)[0];
      cy.contains('Nome').should('be.visible');
      cy.contains(uniquePart).should('be.visible');
      cy.contains('Situação').should('be.visible');
      cy.contains('Data de criação:').should('be.visible');
    });
  });

  it.skip('user sees how many videos a category has', () => {
    cy.createCategory(categoryName, true);
    cy.wait(2000);
    cy.get('[data-cy="nav-item-content"]').click();
    cy.get('[data-cy="upload-encode-content-video-button"]').click();
    cy.get('[data-cy="category-selector"]').find('button').click();
    cy.intercept('GET', '**/category/tree').as('categoryTree');
    cy.get('[data-cy="category-selector-button"]').click();
    cy.wait('@categoryTree');
    cy.contains(categoryName).scrollIntoView().click();
    cy.get('[data-cy="category-selector-tree-button"]').click();
    cy.get('[data-cy="upload-video-drawer"]').selectFile('cypress/fixture/raw-video-content.mp4', {
      action: 'drag-drop',
      force: true,
    });
    cy.get('[data-cy="upload-video-button"]').click();
    cy.get('body').type('{esc}');
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'raw-video-content.mp4 carregado!');
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.wait(2000);
    cy.get(`[data-cy="category-tree-${categoryName}"]`)
      .scrollIntoView()
      .should('have.text', `${categoryName} (1)`);
  });

  it('user search for a category', () => {
    cy.createCategory(categoryName);
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy="tab-category-table"]').click();
    cy.get('[data-cy="type-category-search"]').type(categoryName);
    cy.get('[data-cy="results-filter"]').should('not.exist');
    cy.intercept('GET', '**/category**').as('searchCategory');
    cy.get('[data-cy="search-button"]').click();
    cy.wait('@searchCategory');
    cy.get('[data-cy="results-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy="search_filter_label"]').find('span').should('have.text', categoryName);
      });
    cy.get('[data-cy^="category-row-cat_"]')
      .first()
      .within(() => {
        cy.get('td').eq(1).find('span').eq(0).should('have.text', `${categoryName} (0)`);
      });
  });

  it('User does a quick edit', () => {
    const categoryEdit = faker.animal.type();
    cy.categoryQuickEdit(categoryEdit);
  });

  it('user edit a category', () => {
    cy.createCategory(categoryName, true);
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy="tab-category-table"]').click();
    cy.get(`[data-cy^="category-options-button-${categoryName}"]`).click();
    cy.get('[data-cy="tab-category-table"]').click({ force: true });
    cy.get('[data-cy="editar-row"]').click();
    const newName = faker.person.firstName();
    cy.get('[data-cy="category-name-new-edit"]').type('{selectall}{backspace}').type(newName);
    cy.get('[data-cy="save-button-new-edit"]').click();
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Categoria atualizada!');
  });

  it('User inactives bulk status correctly', () => {
    cy.createCategory(categoryName);
    cy.bulkInactivesCategory();
  });

  it('User activates bulk status correctly', () => {
    cy.createCategory(categoryName);
    cy.bulkActivesCategory();
  });

  it('User deletes a category', () => {
    cy.createCategory(categoryName);
    cy.get('[data-cy="nav-item-categories"]').click();
    cy.get('[data-cy="tab-category-table"]').click();
    cy.get('[data-cy^="category-options-button-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      cy.wrap(randomElement).trigger('click');
      cy.get('[data-cy="delete-row"]').click();
      cy.intercept('DELETE', '**/category/**').as('deleteCategory');
      cy.get('[data-cy="confirm-delete"]').click();
      cy.wait('@deleteCategory').then((interception) => {
        expect(interception.request.url).to.include('category');
        expect(interception.request.method).to.equal('DELETE');
        expect(interception.response?.statusCode).to.equal(200);
      });
      cy.get('#notistack-snackbar')
        .should('be.visible')
        .should('contain.text', 'Categoria deletada!');
    });
  });
});
