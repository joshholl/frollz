Feature: User Authentication

  Scenario: Successful login redirects to dashboard
    Given I am on the login page
    When I enter valid credentials
    Then I should be on the dashboard
