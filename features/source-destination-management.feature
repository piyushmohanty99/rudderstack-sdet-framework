@ui @regression
Feature: Source and Destination Management
  As a RudderStack user
  I want to create and manage sources and destinations
  So that I can set up data pipelines for event tracking

  Background:
    Given I am logged in to RudderStack
    And I am on the connections page

  @smoke @api
  Scenario: Create HTTP source and extract write key
    When I create an HTTP source with name "Test-HTTP-Source"
    Then the HTTP source should be created successfully
    And I should be able to copy and store its write key

  @smoke @integration
  Scenario: Create webhook destination with RequestCatcher URL
    Given I have a valid webhook URL from RequestCatcher
    When I create a webhook destination with name "Test-Webhook-Destination"
    And I configure it with the RequestCatcher URL
    Then the destination should be successfully configured

  @regression
  Scenario: Validate source and destination visibility
    Given I have created a source and destination
    When I navigate to the connections page
    Then I should see the created source in the sources list
    And I should see the created destination in the destinations list
    And both should show as enabled and active
