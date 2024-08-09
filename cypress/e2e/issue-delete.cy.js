// There is an another option to rewrite the test suit using class IssueModal
// import IssueModal from '../pages/IssueModal';
//
// To train selecting elements, I'm not using the class here 


describe('Issue delete', function () {
  beforeEach( function () {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then( function (url) {
        // System will open the first issue on Backlog list and assert it's visibility in beforeEach block
        cy.visit(url + '/board');
        cy.wait(7000);
        cy.get('[data-testid="board-list:backlog"]').first().click();
        cy.get('[data-testid="modal:issue-details"]').as('IssueToDeleteModal').should('be.visible');
      });
  });

  it('Should delete an issue and assert it deletion and non-visibility on board', function () {
    cy.get(this.IssueToDeleteModal).within( function () {
        cy.get('[data-testid="icon:trash"]').click();
        cy.wait(7000);
    });
    cy.get('[data-testid="modal:confirm"]')
        .should('be.visible')
        .contains("Delete issue")
        .click();
    cy.wait(5000);
    cy.get('[data-testid="modal:confirm"]').should('not.exist');
    cy.wait(7000);
    cy.get(this.IssueToDeleteModal).should('not.exist');
    cy.get('[data-testid="board-list:backlog"]').should('be.visible');
    });

    it('Should start deleting an issue and then cancel the proccess', function () {
        cy.get(this.IssueToDeleteModal).within( function () {
            cy.get('[data-testid="icon:trash"]').click();
            cy.wait(7000);
        });
        cy.get('[data-testid="modal:confirm"]')
            .should('be.visible')
            .contains("Cancel")
            .click();
        cy.wait(5000);
        cy.get('[data-testid="modal:confirm"]').should('not.exist');
        cy.get(this.IssueToDeleteModal).get('[data-testid="icon:close"]').first().click();
        cy.get(this.IssueToDeleteModal).should('not.exist');
        cy.wait(7000);
        cy.get('[data-testid="board-list:backlog"]').should('be.visible');
        });
});
