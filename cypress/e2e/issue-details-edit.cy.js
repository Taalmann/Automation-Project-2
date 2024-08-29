describe('Issue details editing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url().should('eq', `${Cypress.env('baseUrl')}project`).then((url) => {
      cy.visit(url + '/board');
      cy.wait(10000);
      cy.contains('This is an issue of type: Task.').click();
    });
  });

  it('Should update type, status, assignees, reporter, priority successfully', () => {
    getIssueDetailsModal().within(() => {
      cy.get('[data-testid="select:type"]').click('bottomRight');
      cy.get('[data-testid="select-option:Story"]')
          .trigger('mouseover')
          .trigger('click');
      cy.get('[data-testid="select:type"]').should('contain', 'Story');

      cy.get('[data-testid="select:status"]').click('bottomRight');
      cy.get('[data-testid="select-option:Done"]').click();
      cy.get('[data-testid="select:status"]').should('have.text', 'Done');

      cy.get('[data-testid="select:assignees"]').click('bottomRight');
      cy.get('[data-testid="select-option:Lord Gaben"]').click();
      cy.get('[data-testid="select:assignees"]').click('bottomRight');
      cy.get('[data-testid="select-option:Baby Yoda"]').click();
      cy.get('[data-testid="select:assignees"]').should('contain', 'Baby Yoda');
      cy.get('[data-testid="select:assignees"]').should('contain', 'Lord Gaben');

      cy.get('[data-testid="select:reporter"]').click('bottomRight');
      cy.get('[data-testid="select-option:Pickle Rick"]').click();
      cy.get('[data-testid="select:reporter"]').should('have.text', 'Pickle Rick');

      cy.get('[data-testid="select:priority"]').click('bottomRight');
      cy.get('[data-testid="select-option:Medium"]').click();
      cy.get('[data-testid="select:priority"]').should('have.text', 'Medium');
    });
  });

  it('Should update title, description successfully', () => {
    const title = 'TEST_TITLE';
    const description = 'TEST_DESCRIPTION';

    getIssueDetailsModal().within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type(title)
        .blur();

      cy.get('.ql-snow')
        .click()
        .should('not.exist');

      cy.get('.ql-editor').clear().type(description);

      cy.contains('button', 'Save')
        .click()
        .should('not.exist');

      cy.get('textarea[placeholder="Short summary"]').should('have.text', title);
      cy.get('.ql-snow').should('have.text', description);
    });
  });

  it('Should check the dropdown Priority options', function () {
    /* According to lms requirements */

    const expected_dropdown_length = 5;
    const dropdown_options = [];
    
    // Getting the issue's already selected priority
    cy.get('[data-testid="select:priority"]').then($option => {  
      const option_text = $option.text();
      cy.log(`Priority dropdown 1. element: ${option_text}`);
      dropdown_options.push(option_text);
      cy.log(`Priority dropdown length at the 1. element: ${dropdown_options.length}`);
      // wrapping here is not needed
      // wrapping gives the possibility to chain further cypress commands
      // wrapped value we can later adress anywhere as: this.wrapped_option_text
      // cy.wrap(option_text).as('wrapped_option_text');
      // cy.log(this.wrapped_option_text);
     
      // This .then part isn't needed, just experimenting
      //}) .then(() => {  // use .then because of JS async nature
      //cy.log(dropdown_options.at(0));
      //cy.log(dropdown_options.length); });
    });
    
    // Getting all other possible priorities..
    getIssueDetailsModal().within(() => {
      // ..opens Priority dropdown menu
      cy.get('[data-testid="select:priority"]').click();
      // ..loops through it for the remaining options
      cy.get('[data-testid*="select-option:"]').each(($opt, index) => {
        //if (index >= 0){  with index we can also choose from which el to start
          dropdown_options.push($opt.text());
          cy.log(`Priority dropdown ${index+2}. element: ${$opt.text()}`); // adding 2 because we already have one el inside and we started counting as humans from 1
          cy.log(`Priority dropdown length at the ${index+2}. element: ${dropdown_options.length}`);
       // }
      }) 
      .then(() => {  // use .then because of JS async nature
        expect(dropdown_options.length).equal(expected_dropdown_length);
      });
    });
  });  
    
  it("Should be only characters in reporter's name", () => {
    // NB! The regex (only for characters) given in LMS /^[A-Za-z\s]$/ isn't correct! 
    const regex = /^[A-Za-z\s]*$/;
   
    getIssueDetailsModal().within(() => {
      cy.get('[data-testid="select:reporter"]').invoke('text').wait(10000).should('match', regex);
    });
  });

  const getIssueDetailsModal = () => cy.get('[data-testid="modal:issue-details"]');
});
