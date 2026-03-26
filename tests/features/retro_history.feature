Feature: Retro History Management
  As an admin facilitator
  I want to view and manage completed retro sessions
  So that I can review past results and clean up old sessions

  Background:
    Given I am logged in as the admin
    And I am on the landing page (no active session)

  Scenario: History list auto-loads when admin panel is visible
    Given there are 3 completed sessions in Firestore ordered newest-first
    When the admin panel renders
    Then the "retro-Lite Session History" panel should appear automatically
    And the sessions should be listed newest-first by date

  Scenario: History shows "Noch keine abgeschlossenen Sessions" when empty
    Given there are no completed sessions in Firestore
    When the admin panel renders
    Then I should see "Noch keine abgeschlossenen Sessions"

  Scenario: View a past session summary
    Given the history shows a session "Sprint March 20" from 20.03.2026
    When I click the "View" button next to "Sprint March 20"
    Then the app should navigate to the summary view for that session

  Scenario: Delete a session — confirmation modal appears
    Given the history shows a session "Sprint March 1"
    When I click the "Delete" button next to "Sprint March 1"
    Then a confirmation modal should appear with the title "Session löschen?"
    And the modal should warn "Diese Aktion kann nicht rückgängig gemacht werden."
    And two buttons "Abbrechen" and "Ja, löschen" should be visible

  Scenario: Cancel a delete
    Given the delete confirmation modal is open for "Sprint March 1"
    When I click "Abbrechen"
    Then the modal should close
    And "Sprint March 1" should still appear in the history list

  Scenario: Confirm a delete removes the session
    Given the delete confirmation modal is open for "Sprint March 1"
    When I click "Ja, löschen"
    Then "Sprint March 1" should be removed from the history list
    And the Firestore document for that session should be deleted
