@api @integration @regression
Feature: Event Processing Validation
  As a RudderStack user
  I want to send events through my configured pipeline
  So that I can validate that events are processed and delivered correctly

  Background:
    Given I have an HTTP source with a valid write key
    And I have the data plane URL
    And I have a webhook destination configured with a test URL

  @smoke @api
  Scenario: Send single event via API and validate delivery
    When I send a track event via API call to the HTTP source
    Then the API call should return a successful response
    And the event should appear in the webhook destination within 30 seconds
    And the delivered events count should increment correctly

  @regression @api
  Scenario: Send multiple events and validate delivery metrics
    When I send 5 track events via API calls to the HTTP source
    Then all API calls should return successful responses
    And all 5 events should appear in the webhook destination
    And the delivered events count should show 5 events
    And the failed events count should remain 0

  @integration
  Scenario: Event processing with different event types
    When I send a track event with event name "Product Viewed"
    And I send a track event with event name "Product Added to Cart"
    And I send a track event with event name "Purchase Completed"
    Then all events should be processed successfully
    And all events should appear in the webhook destination
    And each event should maintain its original event name and properties

  @api @negative
  Scenario: Send event with invalid write key
    Given I have an invalid write key
    When I send a track event via API call with the invalid write key
    Then the API call should return an error response
    And the event should not appear in the webhook destination
    And the failed events count should increment

  @performance
  Scenario: Validate event processing performance
    When I send 10 events in rapid succession to the HTTP source
    Then all events should be processed within 60 seconds
    And the average API response time should be less than 2 seconds
    And all events should be delivered to the webhook destination
    And the events should maintain correct order and timestamps

  @integration @monitoring
  Scenario: Monitor event delivery and failure rates
    Given I have sent multiple events to the source
    When I check the destination metrics
    Then I should see accurate counts for delivered events
    And I should see accurate counts for failed events
    And the success rate should be calculated correctly
    And the delivery timestamps should be recent and valid
