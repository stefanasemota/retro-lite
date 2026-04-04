# Feature: Jira/ClickUp CSV Export
# As a Scrum Master, I want to download a Jira/ClickUp-compatible CSV
# so that I can bulk-import committed action items into our backlog without manual entry.

Feature: Download for Import — Jira/ClickUp CSV Export

  Background:
    Given I am the host of a retrospective session
    And the session is in Phase 4 (Massnahmen)

  # ── BDD Scenario 1: Basic download with 3 action items ──────────────────────
  Scenario: Downloading the import file with 3 action items
    Given there are 3 action items on the board:
      | Summary                           | Assignee | Due Date   |
      | Deploy caching layer              | Stefan   | 2026-04-15 |
      | Review and merge the auth module  | Anna     | TBD        |
      | Update team documentation         | Max      | 2026-04-20 |
    When I click "Download CSV for Backlog"
    Then a file should be downloaded to my machine
    And the filename should match "retro-export-YYYY-MM-DD.csv"
    And the file should contain 4 rows (1 header row + 3 data rows)
    And the header row should contain: Summary,Description,Issue Type,Priority,Labels

  # ── BDD Scenario 2: Comma in Summary is correctly escaped ───────────────────
  Scenario: Summary containing a comma does not break CSV structure
    Given there is 1 action item with the text "Review, refactor, and merge"
    When I click "Download CSV for Backlog"
    And I open the downloaded CSV in a spreadsheet tool
    Then the "Review, refactor, and merge" text should appear in a SINGLE Summary cell
    And the CSV parser should NOT split it into multiple columns

  # ── BDD Scenario 3: Description contains retro context ──────────────────────
  Scenario: Description field contains retro metadata
    Given the session name is "Team Alpha Sprint 42 Retro"
    And today's date is "04.04.2026"
    And there is 1 action item on the board
    When I click "Download CSV for Backlog"
    Then the Description column should contain "Team Alpha Sprint 42 Retro"
    And the Description column should contain "04.04.2026"
    And the Description column should contain "Retro-Lite"

  # ── BDD Scenario 4: Empty board → no download triggered ─────────────────────
  Scenario: No download when there are no action items
    Given there are 0 action items on the board
    When I click "Download CSV for Backlog"
    Then no file download should be triggered
    And the browser should not navigate away

  # ── BDD Scenario 5: Issue Type, Priority, Labels defaults ───────────────────
  Scenario: Jira column defaults are correctly set
    Given there is 1 action item on the board
    When I download the CSV
    Then the "Issue Type" column should contain "Story" for every row
    And the "Priority" column should contain "Medium" for every row
    And the "Labels" column should contain "retro-lite" for every row

  # ── BDD Scenario 6: Participants cannot see the download button ──────────────
  Scenario: Download button is only visible to the host
    Given I am a participant (not the host)
    When I view Phase 4
    Then the "Download CSV for Backlog" button should NOT be visible
