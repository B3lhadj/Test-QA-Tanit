describe('Task Management Journey', () => {
  let authToken;
  let username;

  before(() => {
    // Create a test user via API for consistent testing
    const timestamp = Date.now();
    username = `taskuser${timestamp}`;
    const email = `task${timestamp}@example.com`;
    const password = 'password123';

    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: {
        username,
        email,
        password
      }
    }).then((response) => {
      authToken = response.body.token;
    });
  });

  beforeEach(() => {
    // Login via API and set token
    cy.window().then((win) => {
      win.localStorage.setItem('token', authToken);
      win.localStorage.setItem('user', JSON.stringify({ username, id: 1 }));
    });

    cy.visit('http://localhost:3000/dashboard');
  });

  it('should create, edit, and delete a task', () => {
    // Create a new task
    cy.get('[data-testid="create-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Cypress Test Task');
    cy.get('[data-testid="task-description-input"]').type('This is a test task created by Cypress');
    cy.get('[data-testid="task-status-select"]').select('in-progress');
    cy.get('[data-testid="task-priority-select"]').select('high');
    cy.get('[data-testid="task-submit-button"]').click();

    // Verify task appears in the list
    cy.contains('Cypress Test Task').should('be.visible');
    cy.contains('This is a test task created by Cypress').should('be.visible');

    // Edit the task
    cy.get('[data-testid="task-list"]').within(() => {
      cy.contains('Cypress Test Task').parent().parent().within(() => {
        cy.get('[data-testid^="edit-button-"]').first().click();
      });
    });

    cy.get('[data-testid="task-title-input"]').clear().type('Updated Cypress Task');
    cy.get('[data-testid="task-status-select"]').select('completed');
    cy.get('[data-testid="task-submit-button"]').click();

    // Verify task was updated
    cy.contains('Updated Cypress Task').should('be.visible');
    cy.contains('completed').should('be.visible');

    // Delete the task
    cy.get('[data-testid="task-list"]').within(() => {
      cy.contains('Updated Cypress Task').parent().parent().within(() => {
        cy.get('[data-testid^="delete-button-"]').first().click();
      });
    });

    // Verify task was deleted
    cy.contains('Updated Cypress Task').should('not.exist');
  });

  it('should filter tasks by status and priority', () => {
    // Create tasks with different statuses and priorities
    const tasks = [
      { title: 'High Priority Task', status: 'pending', priority: 'high' },
      { title: 'Low Priority Task', status: 'completed', priority: 'low' },
      { title: 'Medium Priority Task', status: 'in-progress', priority: 'medium' }
    ];

    tasks.forEach(task => {
      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-title-input"]').type(task.title);
      cy.get('[data-testid="task-status-select"]').select(task.status);
      cy.get('[data-testid="task-priority-select"]').select(task.priority);
      cy.get('[data-testid="task-submit-button"]').click();
    });

    // Filter by status
    cy.get('[data-testid="status-filter"]').select('completed');
    cy.contains('Low Priority Task').should('be.visible');
    cy.contains('High Priority Task').should('not.exist');

    // Filter by priority
    cy.get('[data-testid="status-filter"]').select('');
    cy.get('[data-testid="priority-filter"]').select('high');
    cy.contains('High Priority Task').should('be.visible');
    cy.contains('Low Priority Task').should('not.exist');
  });

  it('should update task status directly from task card', () => {
    // Create a task
    cy.get('[data-testid="create-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('Status Update Test');
    cy.get('[data-testid="task-submit-button"]').click();

    // Find the task and update its status
    cy.get('[data-testid="task-list"]').within(() => {
      cy.contains('Status Update Test').parent().parent().within(() => {
        cy.get('[data-testid^="status-select-"]').first().select('completed');
      });
    });

    // Verify status was updated
    cy.contains('Status Update Test').parent().parent().within(() => {
      cy.contains('completed').should('be.visible');
    });
  });
});

