# Goldsmith and Chocosmith system build blueprint

Version 1.0 | 24 October 2026 | Prototype and implementation specification

## Purpose and current delivery

Build one operations system for Goldsmith and Chocosmith covering inventory, production job cards, waste custody, quality, supplier finance, dispatch and traceability. This release is a working browser-local prototype with realistic hypothetical transactions and a source-derived material catalogue. It is suitable for walkthroughs and workflow review, not live stock control or banking.

The user-confirmed project design decisions and subsequent revisions govern this blueprint. They are not evidence of formal client policy sign-off. Later revisions supersede historical selections: notably the current manager limit is 50 lakh per transaction, not the earlier 10 lakh or blanket Director-only rule. The complete v0.9 baseline remains unavailable; original decision ID completeness cannot be certified.

## Data provenance and migration readiness

The supplied Goldsmith & Chocosmith Inventory Master.xlsx has 36 material records, six locations across two entities, ten stock ledger events, two internal transfers, one sales order and five settings. Currency INR is present in the source workbook; adopt INR for this prototype. Do not infer that prices, quantities or customers are validated live operational facts merely because they appear in the workbook.

Source material IDs, names, categories, units, pack sizes, costs and reorder levels are preserved for inspection. Location IDs and names are retained. The workbook settings email is deliberately excluded from the hosted data; it is not authority to send messages. Dates in source transactions are 24 September 2026. Two transfers marked Completed have no transfer events in the supplied ten-event ledger, which contains only opening stock and production issues. Do not infer missing entries or treat source balances as certified opening stock.

The prototype uses a separate hypothetical operating scenario dated 24 October 2026. All lot expiries, job cards, quality evidence, recipe quantities, suppliers, bank references, payments and users beyond the source catalogue are demonstration data. Source prices are displayed as source values, not approved accounting costs. Before migration, reconcile opening quantities by entity, location, material, lot and status; verify dates, units, ownership and transfer pairs; identify source corrections explicitly; obtain process-owner sign-off.

## Main operating example

JC-G-1024-001 plans 1,100 kg of Winner Milk Chocolate. Its sample input accounting is 1,140 kg issued: 1,100 kg consumed, 20 kg unused returns, 15 kg collected waste and 5 kg unrecoverable loss. The first finished-output entry is 600 kg, with further partial output permitted. Input consumption is not another stock balance to add to the output. This is illustrative mass accounting, not a manufacturing formulation or validated yield model.

A recipe example uses catalogue material names and a 1,100 kg input basis. It must never be used as a food production instruction. Real recipes, process losses, shelf life, sample plans, test methods and acceptance criteria require technical validation. Two more active job cards and a closed historical job card show stage and entity differences. Actual inputs, stock movements and stage transformations must be linked explicitly in the production system rather than inferred from recipe proportions.

## Roles and approval matrix

| Role | Intended responsibilities |
|---|---|
| Production operator | Prepare recipes and JCs where authorised; record output, waste and extra-material requests |
| Production manager | Approve recipes after specialist review where needed; release and revise JCs; verify output; approve substitutions and extra material; investigate excessive waste; close and reopen JCs |
| Stores operator | Record actual custody, issues, receipts, waste-bank weighing, dispatch and returns |
| Store manager | Inventory oversight, investigation, count pause, approved operational hold clearance and manager-tier inventory approvals subject to independence |
| Quality | Output inspection and release, rework suitability, immediate post-release hold, evidence-based quality hold removal and recall assessment |
| Accounts operator | Invoice and bank-detail entry, payment proof, advance allocation, refunds and reversal requests |
| Accounts manager | Verification, payment execution, manager-tier financial approvals subject to independence and monthly balance review |
| Director | Above-limit decisions, limit changes, recall response authorisation and incident closure |
| Sales or customer service | Credit requests, authorised customer communication and recall follow-up |

Inventory: store manager up to and including INR 5,000,000 per transaction; supplier payments and customer credits: accounts manager up to and including INR 5,000,000. Above these amounts requires Director approval. No artificial splitting or manager self-approval. Requests stay pending if the required independent approver is unavailable. Changes to limits require Director approval; preserve the version and effective date. Aggregate the full transaction, not each line. Define gross versus net inventory adjustment values, taxes, charges, related-request scope and foreign currency rules before live routing.

Production operational and quality decisions are not overridden by monetary limits. Purchasing exceptions, waste-route authorities and non-monetary configuration changes still need an explicit approval mapping; do not give managers assumed rights in unmapped domains. An investigator preparing a request must not self-approve it. Secure named identities and alternate roles are required in production; the prototype role selector is only a simulator.

## Receiving issues and material returns

Normal supplier receipt links an approved PO and records actual quantity. Without a PO, record controlled custody and hold pending the authorised exception decision; original Director selections are subject to the later tiered model and its unresolved domain mapping. Separate over-delivered quantity and hold it. Leave undelivered PO balance outstanding until receipt or authorised short closure; closure does not create stock. Invoice payment eligibility follows accepted receipt, not merely physical custody.

Material issue uses eligible lots, FEFO where expiry applies and FIFO otherwise. Hold and expiry checks apply at transaction time, across every channel. An approved extra-material request does not issue stock. Stores posts actual GIN quantity, including partial issues, against the respective JC; preserve original requirement and show extra requests, approvals, issues and variance.

Unused production material uses a separate MRN linked to original GIN line and lot. Store manager checks and approves under the selected return workflow. States distinguish expected return, physical receipt into quarantine, inspection, acceptance pending release, rejection pending disposition and completed action. Split quantities where outcomes differ. Never treat a submitted or missing return as received stock. Partial returns leave balances outstanding; unknown lots and unsupported quantities remain identifiable on hold. Preserve original lot and expiry; no shelf-life reset.

## Ledger invariants and holds

The production ledger is append-only. Each event records entity, location, material, lot, status, quantity, unit, custody source and destination, source document and line, actor, timestamp, reason and reversal link. Transfers and status changes balance quantities; true losses and gains use separately authorised events. Decide whether issued material remains WIP inventory or is expensed with accounts before financial postings are implemented.

Posting must be atomic and idempotent. Use unique business-event keys, database constraints and locked balance checks. Never allow negative available quantities or double stock creation from retries. Preserve original entered units and conversion versions. Maintain holds as separate records rather than one overwritable status: missing expiry, quality, discrepancy, count pause and incident holds may coexist. Removing one hold cannot remove another. Reserved or picked stock is still checked before issue or dispatch.

Missing required expiry: hold and segregate. Store manager verifies documented supplier or manufacturer evidence and may clear only that hold after valid date and required checks. Expired stock is automatically blocked even after prior release. Store manager receives expiry alerts 30, 15 and 7 days in advance, adjustable by material, through system and email. Exact date boundary, shelf-life criteria and configuration authority need validation.

## Counting and reconciliation

Full monthly count plus weekly counts for high-value or frequently discrepant materials. Store manager proposes list, accounts verifies values and list approval follows the applicable agreed authority. Store manager starts and ends a scoped movement pause. Initial counts are blind; another store team member performs a blind recount. If results differ, a store team member performs a verification count supervised by store manager and both sign. Preserve every result.

Store manager investigates; accounts verifies value and prepares a correction; the independent authorised tier approves; system posts once and notifies Director and store team through system and email. Affected stock stays held while unresolved. Store manager clears the discrepancy hold only after successful posting and resolved investigation. Counter shortages must not be disguised as MRNs, consumption or waste. A corrected source transaction and a separate loss adjustment must not both deduct the same difference.

## Production and job cards

Operator or planner prepares the JC, production manager approves release and all revisions preserve prior versions and actuals. Each JC links an approved recipe version: operator prepares, specialist reviews where required, production manager gives final approval. Substitution requires production manager approval and required specialist review before use. Actual used material and lot remain recorded.

Every JC supports multiple dated partial finished and semi-finished outputs by stage, unit and batch. Never sum kilograms of semi-finished material with finished boxes or double-count a stage transfer. Production manager verifies output, stores records physical receipt and quality controls inspection release. In-process transfer without stores custody requires its own explicit design rather than fictitious receipt. Batch boundaries, consumption allocation and variable conversions require real process data.

Overproduction preserves original plan and actual quantities and requires manager review. Underproduction may close with manager approval, documented shortfall and reconciled materials, returns and waste. Output completion alone does not close a JC. Production manager closes after reconciliation and appropriately authorised exceptions, or reopens with approval, reason and history. Closure is separate from quality release and financial correction.

## Waste bank

Production declares collected waste; stores independently weighs and receives. Store manager monitors and investigates dispatch-versus-receipt differences. Production manager investigates excessive process waste. Product or process-specific limits derive from actual data; while undefined show quantities and trends. Threshold breaches notify production manager through system and email. Routine receipts do not require manager approval every time.

Waste bank opening plus actual receipts minus executed authorised outflows equals closing stock. Declared but unreceived waste is not bank stock. Unrecoverable loss creates no fictitious stock. Preserve waste class, original JC, source traceability, actual weight, location, reason and hold status. Financial value requires an accounting decision rather than an assumed zero.

Provide all four routes: rework or reuse, recycler sale, supplier return and disposal. Initially keep them unavailable by waste type until eligibility, technical checks, approvers and evidence requirements are configured. Route capability is not permission. Rework uses quality suitability and a linked manager-approved JC, followed by fresh quality release. Disposal approval alone does not reduce stock: stores executes under manager supervision with dual signatures, accounts verifies completion evidence and actual disposed quantity posts once. Partial completion leaves a held remainder. Notify Director and store team after disposal posting through both channels.

## Quality traceability and recalls

System-generated finished and semi-finished batches link JC, stage and actual input genealogy. Quality release is required before use or dispatch. Failed output remains physically segregated and digitally held. Post-release quality can immediately hold affected batches, blocking further use and dispatch without waiting for acknowledgement or monetary approval. Alert Director, production manager and store manager immediately through system and email.

Dispatch retains actual batch and quantity by customer. Trace remaining stock and affected customer deliveries. Quality assesses and recommends response, Director authorises customer communication or recall, sales contacts customers, quality provides instructions and stores receives returns into quarantine. Dashboard tracks dispatched, returned and unresolved amounts with a customer follow-up owner. Quality reviews outcome and Director approves incident closure. Only quality clears the post-release quality hold after checks; incident closure does not release stock. Product-specific urgent response and external requirements need validation before live use.

## Supplier and customer finance

Operator enters supplier invoices and documents; accounts manager verifies. Accounts matches approved PO and actual accepted receipt, holding mismatch for investigation. Exception approval follows the applicable defined authority; payment approval remains separate. Detect duplicate invoice entry by supplier and entity, while allowing repeated invoice references in reconciliation, advance applications and partial payments. Pending payments alone do not create a hard block: show pending exposure separately and control actual confirmed settlement.

Supplier advance stays unallocated under supplier until linked to an invoice number. Operator allocates; accounts manager verifies. Retain unused balance, prevent double allocation, review monthly, and record refunds with bank proof and manager verification before reducing the balance. Correct wrong allocations through linked verified reversal, not deletion. Supplier credits settle outstanding invoice amounts; excess stays separately available or is refunded where future purchases are unlikely. Preserve invoice histories and confirmed versus pending amounts.

Operator enters supplier bank details, accounts manager independently verifies with trusted contact before use. Director receives system and email information only, not an approval request. Accounts manager executes approved payments. Operator enters bank reference and proof; accounts manager verifies before completion. Notify Director and accounts manager through both channels. Bank submission is not successful payment. Bank mandates and evidence validation need confirmation.

Ordinary customer returns link original invoice or dispatch, batch, quantity and reason and remain quarantined for quality assessment. Sales requests customer credit, accounts verifies, accounts manager approves up to 50 lakh and Director above. Credit stays available against invoices; cash refund is separate. Suggested extension of operator entry and manager verification to customer-credit allocations and refunds is a consulting default, not a separately confirmed monetary authority for cash refunds.

## Production architecture proposal

Use a browser application with a server API and a relational transactional database. Select the actual hosting provider in implementation; none is required to review the current static prototype. Separate identity, permission evaluation, workflow transitions, quantity posting, evidence storage and notification delivery. Server validates every transition and authority; hiding a button is insufficient. Use durable object storage for signed evidence, an outbox for email delivery after commit, and job processing for expiry review and report refresh. No payment API is enabled by default.

Core records: entity, site, location, user, role assignment, approval policy version, material, unit conversion version, recipe version, JC version, stage, issue, return, batch and genealogy edge, stock event, hold, inspection, count session and result, discrepancy, waste receipt and route action, PO and receipt, supplier invoice, advance, credit, allocation, payment, bank evidence, dispatch, customer return, recall incident, audit event and notification outbox. Use stable internal IDs alongside source business numbers and source provenance.

Events commit stock, workflow and audit together, then delivery workers send notifications. Retry notifications independently from stock or payment posting. Store monetary amounts as exact decimal or minor currency units and quantities as approved precision decimals. Preserve financial and stock status separately. Implement entity-scoped access, secure sessions, evidence access logs, backup recovery and named-user separation before live pilot.

## Implemented prototype boundary

Interactive: source catalogue search; entity views; JC drill-down; partial output; production verification; extra requests, approval and FEFO issue; waste declaration and independent receipt; quality decisions and incident holds; supplier receipts into hold; payment threshold approval, simulated submission, proof and completion; invoice history; dispatch and recall trace; blind initial count; activity and simulated notifications; browser persistence, reset and JSON export.

Specified but not fully implemented: authenticated multi-user access, durable shared database, full double-entry stock and finance ledger, actual email, attachments, automated reconciliation, complete PO/MRN and transfer workflows, count pause and independent recount sessions, JC preparation/revision/closure execution, technical waste-route activation, customer-credit/refund execution and full recall closure. The prototype is intentionally explicit about these boundaries. Do not use local browser state as the accounting or stock system of record.

## Demonstration acceptance scenarios

1. Production operator records partial output; production manager verifies; Quality releases; Stores dispatches only available eligible quantity.
2. Try dispatch before release, after expiry or after a quality incident: block without changing quantity.
3. Place a quality hold after dispatch and show affected customer plus remaining stock and simulated alerts.
4. Declare 5 kg collected waste and receive 4.8 kg: preserve both numbers, hold actual 4.8 kg and flag investigation.
5. Approve extra 5 kg, issue 3 kg and show 2 kg remaining; block issue above remaining allowance and held lots.
6. Accounts manager approves PAY-001 of 80,000; cannot approve PAY-002 of 52 lakh. Director can approve PAY-002.
7. Payment cannot complete before submission, operator evidence and accounts manager verification; repeated completion cannot post again.
8. A blind count mismatch must not directly change stock and must block subsequent affected issue or dispatch.
9. Receipt with missing expiry or excess remains held and cannot use normal release to bypass the exception.
10. Reload and retain browser walkthrough state; reset restores only examples, leaving source workbook unchanged.

## Remaining validation and next build

Review this prototype with actual users by running the walkthrough, not another long questionnaire. Record differences as one consolidated change list. Recover v0.9 if available; reconcile IDs and source records. Replace examples with actual recipe and quality specifications, named permissions, batch boundaries and approved opening balances. Validate all authority gaps, amount basis, accounting mappings and external requirements. Build server-backed workflows, execute acceptance scenarios with independent users, test concurrent posting and recovery, then pilot in one store and production line before wider rollout.
