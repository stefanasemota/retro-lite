Feature: PNG Export of Genesis Matrix
  As an admin facilitator
  I want to export the Phase 4 action matrix as a PNG
  So that I can share it with stakeholders outside the app

  Background:
    Given I am logged in as the admin
    And there is an active session in Phase 4 with at least one action item

  Scenario: Export button is visible in Phase 4
    When I view the Genesis Evolution Matrix
    Then I should see an "Export as PNG" button next to the matrix title

  Scenario: Successful PNG export downloads a file
    Given the matrix has one action item "Fix CI pipeline" assigned to "Alice"
    When I click the "Export as PNG" button
    Then a PNG file named "retro-Lite_Actions_<today>.png" should be downloaded
    And a green success toast "PNG erfolgreich exportiert ✓" should appear for 4 seconds

  Scenario: Export shows a toast on failure
    Given the html2canvas library throws an error
    When I click the "Export as PNG" button
    Then a red error toast starting with "Export fehlgeschlagen:" should appear
    And no native alert dialog should be shown

  Scenario: Export button not visible in Phase 1
    Given the session is in Phase 1
    When I view the main board
    Then I should not see an "Export as PNG" button
