# How to Import Retro-Lite Action Items into Jira and ClickUp

This guide explains how to use the **"Download CSV for Backlog"** button in Retro-Lite and import the resulting file into your project management tool as Stories or Tasks.

---

## Step 1 — Download the CSV from Retro-Lite

1. Complete your retrospective and navigate to **Phase 4 (Massnahmen)**.
2. Fill in the "Konkrete Maßnahme" (what), Assignee, and Due Date fields for each action item.
3. Click **"Download CSV for Backlog"** in the Genesis Evolution Matrix header.
4. A file named `retro-export-YYYY-MM-DD.csv` will be saved to your Downloads folder.

### CSV Column Reference

| Column | Content | Jira Field | ClickUp Field |
|--------|---------|------------|---------------|
| `Summary` | The committed Massnahme text | Summary | Task Name |
| `Description` | Retro date, team name, source anchor, Retro-Lite attribution | Description | Description |
| `Issue Type` | `Story` (hardcoded) | Issue Type | — (use Task filter) |
| `Priority` | `Medium` (hardcoded) | Priority | Priority |
| `Labels` | `retro-lite` | Labels | Tags |

> **Note:** The CSV file uses the **BOM-prefixed UTF-8** encoding (`\uFEFF`) to ensure German umlauts (ä, ö, ü) display correctly in Excel and Google Sheets.

---

## Step 2a — Import into Jira

### Cloud (Jira Software)

1. Go to your **Jira project board** → `Project settings` → `Import issues`.
2. Select **"CSV"** as the import format.
3. Upload `retro-export-YYYY-MM-DD.csv`.
4. Click **"Map fields"** and configure the mapping:

   | CSV Header | Jira Field |
   |------------|------------|
   | `Summary` | Summary |
   | `Description` | Description |
   | `Issue Type` | Issue Type |
   | `Priority` | Priority |
   | `Labels` | Labels |

5. Click **"Begin Import"**.
6. After import, use `Labels = retro-lite` in the backlog filter to find all retro action items.

### Server / Data Center

1. Install the [CSV Import for Jira](https://marketplace.atlassian.com/apps/6351) plugin if not already installed.
2. Go to `System` → `Import & Export` → `External System Import` → **CSV**.
3. Upload the file and follow the field mapping wizard above.

---

## Step 2b — Import into ClickUp

1. Open your **ClickUp Space or List**.
2. Click the **`⋮` (more)** menu → `Import/Export` → `Import`.
3. Select **"CSV"**.
4. Upload `retro-export-YYYY-MM-DD.csv`.
5. ClickUp will auto-detect the column headers. Map them:

   | CSV Header | ClickUp Field |
   |------------|---------------|
   | `Summary` | Task Name |
   | `Description` | Description |
   | `Priority` | Priority |
   | `Labels` | Tags |

6. Click **"Import"** — tasks will appear in the selected List.
7. Filter by `Tags = retro-lite` to view all retro-imported tasks.

---

## Tips & Troubleshooting

| Problem | Solution |
|---------|----------|
| Commas in a summary break the CSV | This should not happen — Retro-Lite wraps every cell in double-quotes per RFC-4180. If you see splitting, ensure you are not opening the file in a plain text editor. |
| Umlauts appear as `?` | Ensure your import tool reads the file as **UTF-8**. Excel on Windows: `Data` → `From Text/CSV` → encoding: `65001 Unicode (UTF-8)`. |
| Issue Type rejected by Jira | Jira requires "Story" to exist in your project's Issue Type scheme. If it is missing, change the value to "Task" in the CSV before importing. |
| ClickUp does not accept "Issue Type" | ClickUp ignores unknown columns — this is safe to leave as-is. |
| Action item `Summary` is empty | Ensure you filled in the "Konkrete Maßnahme (What)" field in Phase 4 before downloading. |

---

## Automating the Import (CI/CD)

If your team runs automated retro exports, you can use the **Jira REST API** to create issues programmatically from the CSV instead of the GUI wizard:

```bash
# Example: Create a Jira issue from a CSV row using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -u "your-email@company.com:YOUR_API_TOKEN" \
  "https://your-company.atlassian.net/rest/api/3/issue" \
  -d '{
    "fields": {
      "project": { "key": "PROJ" },
      "summary": "Deploy caching layer",
      "description": { "type": "doc", "version": 1, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Retro: 04.04.2026, Team: Team A. Erstellt via Retro-Lite." }] }] },
      "issuetype": { "name": "Story" },
      "priority": { "name": "Medium" },
      "labels": ["retro-lite"]
    }
  }'
```

See the [Jira REST API documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/) and [ClickUp API v2](https://clickup.com/api/) for full details.
