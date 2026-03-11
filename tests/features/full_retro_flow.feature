Feature: Full Retro Flow

  Scenario: Complete retrospective cycle from Phase 1 to Phase 4
    Given I am on the start page in test mode
    When I create a new session named "BDD Test Session"
    And I enter "I liked the new features" in the category "liked"
    And I reveal the board
    And I vote for the card "I liked the new features"
    And I identify the winner and start "Ursachenforschung"
    Then the sidebar should show the anchor "I liked the new features"
    
    When I enter the cause "Good team collaboration"
    And I vote for the cause "Good team collaboration"
    And I identifying the cause winner and start "Lösung finden"
    Then the sidebar should show anchor and cause "Good team collaboration"

    When I enter the solution "Maintain high transparency"
    And I vote for the solution "Maintain high transparency"
    And I identify the solution winner and start "Massnahme festlegen"
    Then the sidebar should show the full context trail ⚓ 🔍 💡
