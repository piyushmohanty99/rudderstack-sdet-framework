@ui @smoke
Feature: Login and Navigation
  As a RudderStack user
  I want to log in to the application
  So that I can access the connections page and see the data plane URL

  Background:
    Given I have a valid RudderStack business email account

  @regression
  Scenario: Successful login and navigation to connections page
    When I log in to the application
    Then I should be successfully logged in
    And I should be able to navigate to the connections page
    And I should see the data plane URL in the top right corner

  @negative
  Scenario: Login with invalid credentials
    When I try to log in with invalid credentials
    Then I should see an error message
    And I should remain on the login page

  @regression
  Scenario: Navigation after successful login
    Given I am logged in to the application
    When I navigate to the connections page
    Then I should see the connections dashboard
    And I should see options to add sources and destinations
    And I should see the data plane URL displayed prominently
