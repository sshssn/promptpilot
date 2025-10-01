# Customer Operations SOP Pack — RAG Source
_Last updated: 2025-09-24_

> **Purpose:** This file is optimized as a Retrieval-Augmented Generation (RAG) knowledge source. It contains clear, step-by-step Standard Operating Procedures (SOPs) that a support agent or chatbot can follow verbatim.

---

## Steps Taken to Add Additional License(s)

1. Confirm the request details (number of licenses, urgency, and user role type if specified).
2. Check current license usage and confirm all licenses are occupied (if relevant).
3. Offer alternatives if possible (e.g., deactivate unused users).
4. Ask the customer for confirmation to proceed with adding licenses.
5. Create and log a support ticket (provide the ticket ID for tracking).
6. Forward the request to the relevant team for processing.
7. Inform the customer about expected processing time and whether an invoice will follow.
8. Notify the customer via email once the license(s) is/are added.
9. Follow up to confirm that the new license is visible and working in the account.

**Response Template (Licenses):**  
- Acknowledge the request and restate quantity/roles/urgency.  
- If all licenses are in use, suggest deactivating unused users or proceed with purchase.  
- Ask for confirmation to proceed.  
- After creation: provide ticket ID, expected processing time, billing info.  
- Confirm by email when complete and verify visibility in the account.

---

## Steps Taken for Mobile Feature Enable/Disable/Modify

1. Confirm the feature/requirement/issue with the customer.
2. Ask for permission to access the account.
3. Request account/job details or screenshots if needed.
4. Check backend settings for verification.
5. Explain impact (applies to all engineers).
6. Ask for permission to proceed.
7. Enable, disable, or modify the feature from the backend.
8. Provide instructions to refresh, update, or sync the app.
9. Follow up to confirm the feature is visible/working.

**Response Template (Mobile Feature):**  
- Confirm feature + account scope and request temporary access permission.  
- Ask for any needed IDs/screenshots.  
- Explain that the change affects all engineers.  
- After change: tell the user how to refresh/update/sync.  
- Follow up to confirm visibility and function.

---

## Steps Taken for Bulk Data Change

1. Clarify what the customer wants (duplicate invoices, amend payment terms, deploy forms, etc.).
2. Ask for job numbers, invoice IDs, account access, or sample files to validate the scope of bulk changes.
3. Note that some actions (e.g., reverting approved invoices, CSV batch updates) may not be directly supported.
4. Suggest submitting Excel files for bulk imports, manual updates, or backend processing.
5. Raise tickets with IDs, escalate to relevant team, and provide status updates.
6. Flag that this may be a chargeable task.
7. Commit to updating customers via email.

**Response Template (Bulk Data Change):**  
- Summarize the requested change and confirm scope with concrete IDs/examples.  
- Explain limits (e.g., cannot revert approved invoices via UI) and propose supported alternatives (Excel import/manual/backend).  
- Provide ticket ID and note that charges may apply.  
- Confirm by email when done and ask the customer to validate.

---

## Glossary / Entities (for better RAG retrieval)

- **License**: A seat or entitlement enabling a user role.  
- **Mobile Feature**: A setting toggled at account level that affects all engineers.  
- **Bulk Data Change**: Non-trivial multi-record update; may require import, manual ops, or backend task.  
- **Ticket ID**: Tracking identifier for requests/escalations.

---

## Metadata (recommended when ingesting)

- **Category**: `Licenses` | `MobileFeature` | `BulkChange`  
- **Audience**: `Support` | `Admin`  
- **SLA**: e.g., `Standard`, `Urgent`  
- **Updated**: `2025-09-24`  
- **Version**: `1.0`
