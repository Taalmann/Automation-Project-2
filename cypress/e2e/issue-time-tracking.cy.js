// The system is SO slow that I didn't have time (with all those endless cy.wait()) to make the code shorter and the logic better

describe('Issue time estimation and time logging', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.wait(10000);
        cy.url().should('eq', `${Cypress.env('baseUrl')}project/board`).then((url) => {
            // System opens issue creating modal
             cy.visit(url + '/board?modal-issue-create=true');
             CreateNewBugIssue();
             cy.wait(15000);
             openNewBugIssue();
        });
    });
 
    const new_bug_issue_title = 'Big Bug';
    const new_bug_issue_description = 'Funny bug';
    const time_estimation = 10;
    const time_estimation_new = 20;
    //const time_tracking_estimated = '10h estimated';
    //const time_tracking_estimated_new = '20h estimated';
    const time_tracking_h_estimated = 'h estimated';

    const input_time_estimation = 'input[placeholder="Number"]';
    
    const openNewBugIssue = () => cy.get('[data-testid="board-list:backlog"]').should('be.visible').contains(new_bug_issue_title).click(); 
    const getIssueDetailsModal = () => cy.get('[data-testid="modal:issue-details"]');
    const getTimeTrackingModal = () => cy.get('[data-testid="modal:tracking"]');
    
    function CreateNewBugIssue () {
        cy.wait(7000);
        // System finds modal for creating issue and does next steps inside of it
        cy.get('[data-testid="modal:issue-create"]').within(() => {
        // Type value to description input field
        cy.get('.ql-editor').type(new_bug_issue_description);
        cy.get('.ql-editor').should('have.text', new_bug_issue_description);
  
        // Type value to title input field
        // Order of filling in the fields is first description, then title on purpose
        // Otherwise filling title first sometimes doesn't work due to web page implementation
        cy.get('input[name="title"]').type(new_bug_issue_title);
        cy.get('input[name="title"]').should('have.value', new_bug_issue_title);
  
        // Open issue type dropdown and choose Bug
        cy.get('[data-testid="select:type"]').click();
        cy.get('[data-testid="select-option:Bug"]').wait(1000).trigger('mouseover').trigger('click');
        cy.get('[data-testid="icon:bug"]').should('be.visible');
  
        // Select Pickle Rick from reporter dropdown
        cy.get('[data-testid="select:reporterId"]').click();
        cy.get('[data-testid="select-option:Pickle Rick"]').click();
  
        // Select Lord Gaben from assignee dropdown
        cy.get('[data-testid="form-field:userIds"]').click();
        cy.get('[data-testid="select-option:Lord Gaben"]').click();
  
        // Select highest priority
        cy.get('[data-testid="select:priority"]').click();
        cy.get('[data-testid="select-option:Highest"]').click();
  
        // Click on button "Create issue"
        cy.get('button[type="submit"]').click();
      });
  
      // Assert that modal window is closed and successful message is visible
      cy.wait(10000);
      cy.get('[data-testid="modal:issue-create"]').should('not.exist');
      cy.contains('Issue has been successfully created.').should('be.visible');
  
      // Reload the page to be able to see recently created issue
      // Assert that successful message has dissappeared after the reload
      cy.reload();
      cy.contains('Issue has been successfully created.').should('not.exist');
    }
    
    function CloseIssueWindow () {
        cy.get('[data-testid="icon:close"]').first().click();
        cy.get('[data-testid="modal:issue-details"]').should('not.exist');    
    }

    function ReopenIssueWindow () {
        cy.get('[data-testid="board-list:backlog"]').should('be.visible').contains(new_bug_issue_title).click();
    }


    it('Should add, edit and remove time estimation', () => {
        /* In accordance with given test cases */
        
        getIssueDetailsModal;
        // No spent time is logged in
        cy.contains('No time logged').should('be.visible');
        cy.contains('Original Estimate (hours)').click();

        // Add time estimation..
        cy.get(input_time_estimation).should('not.have.value').and('be.visible').type(time_estimation);  
        // ..check that it contains recently added time estimation and it's also visible in the Time tracking section
        cy.get(input_time_estimation).should('have.value', time_estimation).and('be.visible');
        cy.contains(`${time_estimation}${time_tracking_h_estimated}`).should('be.visible'); //.and('equal', time_tracking_estimated);
        // ..close and reopen the issue window
        CloseIssueWindow(); 
        ReopenIssueWindow();
        cy.wait(7000);
        // ..check that it contains recently added time estimation and it's also visible in the Time tracking section 
        cy.get(input_time_estimation).should('have.value', time_estimation).and('be.visible');
        cy.contains(`${time_estimation}${time_tracking_h_estimated}`).should('be.visible'); //.and('equal', time_tracking_estimated);
        CloseIssueWindow();

        // Edit time estimation
        ReopenIssueWindow();
        cy.get(input_time_estimation).clear().type(time_estimation_new);  
        //cy.wait(7000);
        cy.get(input_time_estimation).should('be.visible').and('have.value', time_estimation_new); 
        cy.contains(`${time_estimation_new}${time_tracking_h_estimated}`).should('be.visible');
        // ..close and reopen the issue window
        CloseIssueWindow(); 
        ReopenIssueWindow();
        cy.wait(7000);
        // ..check that it contains recently added time estimation and it's also visible in the Time tracking section 
        cy.get(input_time_estimation).should('have.value', time_estimation_new).and('be.visible');
        cy.contains(`${time_estimation_new}${time_tracking_h_estimated}`).should('be.visible'); 
        CloseIssueWindow();

        // Remove time estimation
        ReopenIssueWindow();
        cy.get(input_time_estimation).clear();
        //cy.wait(7000);
        cy.get(input_time_estimation).should('not.have.value').and('be.visible');
        // ..check the placeholder
        //cy.contains('Number');
        // ..close and reopen the issue window
        CloseIssueWindow(); 
        ReopenIssueWindow();
        cy.wait(7000);
        cy.get(input_time_estimation).should('not.have.value').and('be.visible')
        // ..check the placeholder
        //cy.contains('Number').should('be.visible');
        CloseIssueWindow();
    });    

    it('Should log time and remove logged time', () => {
        /* Based on given test cases */
        const time_spent = 2;
        const time_remaining = 5;
        const time_tracking_h_logged = 'h logged';
        const time_tracking_h_remaining = 'h remaining';
        
        const input_time_spent = () => cy.get('input[placeholder="Number"]').first();
        const input_time_remaining = () => cy.get('input[placeholder="Number"]').last();

        // Preconditions: 1. Time estimation should be added..
        cy.get(input_time_estimation).should('not.have.value').and('be.visible').type(time_estimation);  
        // ..check that it contains recently added time estimation and it's also visible in the Time tracking section
        cy.get(input_time_estimation).should('have.value', time_estimation).and('be.visible');
        cy.contains(`${time_estimation}${time_tracking_h_estimated}`).should('be.visible');
        //                2. No spent time is logged in
        cy.contains('No time logged').should('be.visible');

        // Open Time Tracking window 
        cy.get('[data-testid="icon:stopwatch"]').click();

        // Time logging
        getTimeTrackingModal().should('be.visible').within(() => { 
            cy.wait(7000);
            input_time_spent().type(time_spent);
            input_time_remaining().clear().type(time_remaining); 
            cy.contains('button', 'Done').click();
        });
        cy.contains('button', 'Done').should('not.exist');
        cy.wait(10000);
        //cy.contains('No time logged').should('not.be.visible');
        cy.contains(`${time_spent}${time_tracking_h_logged}`).should('be.visible');
        cy.contains(`${time_remaining}${time_tracking_h_remaining}`).should('be.visible');

        // Open Time Tracking window 
        cy.get('[data-testid="icon:stopwatch"]').click();

        // Remove logged time
        getTimeTrackingModal().should('be.visible').within(() => { 
            cy.wait(7000);
            input_time_spent().clear();
            input_time_remaining().clear(); 
            cy.contains('button', 'Done').click();
        }); 
        cy.contains('button', 'Done').should('not.exist');
        cy.wait(10000);
        cy.contains('No time logged').should('be.visible');
        cy.contains(`${time_estimation}${time_tracking_h_estimated}`).should('be.visible');          
    });    
});