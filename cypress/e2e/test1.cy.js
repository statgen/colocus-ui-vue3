/// <reference types="cypress" />

describe('Basic page navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  it('displays the home page', () => {
    cy.get('h1').should('contain', 'Home')
  })

  it('goes to the search page', () => {
    cy.get('.v-toolbar__content').contains('Search').click()
    cy.get('h1').should('contain', 'Search')
  })

  it('goes to the studies page', () => {
    cy.get('.v-toolbar__content').contains('Studies').click()
    cy.get('h1').should('contain', 'Studies')
  })

  it('goes to the help page', () => {
    cy.get('.v-toolbar__content').contains('Help').click()
    cy.get('h1').should('contain', 'Help')
  })
})

describe('Test search page', function () {
  beforeEach(() => {
    cy.visit('http://localhost:5173/search')
  })

  it('test the study selector', () => {
    cy.get('.v-toolbar__content').contains('Search').click()
    cy.get('#studyInput').type('AdipoExpress{enter}{esc}{esc}')
    cy.get('.v-data-table__tbody > :nth-child(1) > :nth-child(3) > [data-v-dd96f50a=""] > span').should('contain', 'Adi...xpress')
  })

  it('test the gene selector', () => {
    cy.get('#qtlGene').type('IRS1{enter}{esc}{esc}')
    cy.get(':nth-child(1) > :nth-child(4) > .d-inline > [data-v-tippy=""] > .text-no-wrap').should('contain', 'IRS1')
  })

  it('test the region specifier', () => {
    cy.get('#region').type('1:1-2000000')
    cy.get('.v-data-table-footer__info > div').should('contain', '1-10 of 23')
  })

  it('test the phenotype selector', () => {
    cy.get('#phenotype').type('coronary{enter}{esc}{esc}')
    cy.get(':nth-child(2) > .d-inline > [data-v-tippy=""] > .text-no-wrap').should('contain', 'CAD')
  })

  it('test the tissue selector', () => {
    cy.get('#qtlTissue').type('islet{enter}{esc}{esc}')
    cy.get('.v-data-table-footer__info > div').should('contain', '1-10 of 52')
  })

})
