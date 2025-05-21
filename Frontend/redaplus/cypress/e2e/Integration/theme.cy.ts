/// <reference types="cypress" />

describe('Theme', () => {
  beforeEach(() => {
    cy.login(Cypress.env('user_name'), Cypress.env('user_password'));
    cy.visit('/dashboard');
  });

  beforeEach(() => {
    cy.wait(500);
    cy.get('[data-cy="nav-item-statistics"]').click();
  });

  it('User changes mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('body')
      .should('have.css', 'background-color', 'rgb(22, 28, 36)')
      .should('have.css', 'color', 'rgb(255, 255, 255)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes contrast', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(2) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('body').should('have.css', 'background-color', 'rgb(244, 246, 248)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to green in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-1boz7wd').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(0, 167, 111)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to green in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-1boz7wd').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(91, 228, 155)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to light blue in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(2)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(7, 141, 238)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to light blue in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(2)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(104, 205, 249)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to purple in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(3)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(118, 53, 220)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to purple in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(3)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(185, 133, 244)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to dark blue in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(4)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(32, 101, 209)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to dark blue in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(4)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(118, 176, 241)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to orange in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(5)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(253, 169, 45)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to orange in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(5)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(254, 214, 128)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to red in light mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(6)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(255, 48, 48)');
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User changes color to red in dark mode', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get(':nth-child(1) > .MuiStack-root > .css-1y0jul3').click(); // TODO - adicionar data-cy
    cy.get('.css-9bfxv1 > :nth-child(6)').click(); // TODO - adicionar data-cy
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(255, 193, 172)');
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });

  it('User reset theme', () => {
    cy.get('.css-0 > .MuiButtonBase-root').click(); // TODO - adicionar data-cy
    cy.get('[aria-label="Reset"]').click(); // TODO - adicionar data-cy
    cy.get('body')
      .should('have.css', 'background-color', 'rgb(255, 255, 255)')
      .should('have.css', 'color', 'rgb(33, 43, 54)');
    cy.get('[data-cy="nav-item-statistics"]').should('have.css', 'color', 'rgb(0, 167, 111)');
    cy.get('.css-1nndebo > :nth-child(3)').click(); // TODO - adicionar data-cy
  });
});
