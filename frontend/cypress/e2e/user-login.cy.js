describe('User Login Journey', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('http://localhost:3000/login');
  });

  it('should complete user registration and login flow', () => {
    const timestamp = Date.now();
    const username = `cypressuser${timestamp}`;
    const email = `cypress${timestamp}@example.com`;
    const password = 'password123';

    // Register a new user
    cy.contains('Register here').click();
    cy.url().should('include', '/register');

    cy.get('[data-testid="username-input"]').type(username);
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="confirm-password-input"]').type(password);
    cy.get('[data-testid="register-button"]').click();

    // Should redirect to dashboard after registration
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
    cy.contains(username).should('be.visible');

    // Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');

    // Login with registered credentials
    cy.get('[data-testid="username-input"]').type(username);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should display error for invalid login credentials', () => {
    cy.get('[data-testid="username-input"]').type('nonexistent');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    // Should show error message
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="login-button"]').click();

    // HTML5 validation should prevent submission
    cy.get('[data-testid="username-input"]').should('have.attr', 'required');
    cy.get('[data-testid="password-input"]').should('have.attr', 'required');
  });
});

