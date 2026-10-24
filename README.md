# Goldsmith & Chocosmith Operations

An interactive inventory and production operations prototype covering two food manufacturing businesses. It combines a source-derived material catalogue with clearly labelled hypothetical workflows.

## Open the prototype

- Hosted version: enable GitHub Pages from the main branch, repository root.
- Offline version: download `Goldsmith_Chocosmith_Prototype.html` and open it in your browser. No installation or internet is needed.
- Select **Start walkthrough** on the overview. Use the role selector to move between operator, manager, quality and accounts workflows.

This is a workflow simulator. It has no live banking, email delivery, secure sign-in or shared database. Browser-local changes can be exported or reset from Blueprint & demo guide.

## Included workflows

- Inventory material catalogue, locations, lots, expiry and hold status.
- Job-card dashboard, partial finished and semi-finished output and additional material requests.
- Waste-bank declaration, independent weighing and receipt discrepancies.
- Production verification, quality decisions and immediate post-release holds.
- Supplier payment approvals, simulated submission, bank proof and verification.
- Invoice reconciliation, advances and confirmed versus pending payments.
- Batch dispatch, customer traceability and incident monitoring.
- Initial blind counts, activity history and simulated notifications.

## Approval design

Store manager: inventory approval up to and including INR 50 lakh per transaction. Accounts manager: supplier payments and customer credits up to and including INR 50 lakh. Director approval above these limits. No manager self-approval or artificial splitting. Quality restrictions are separate from monetary approvals.

## Data and scope

The supplied inventory workbook contributes 36 materials, six locations, ten ledger events, two internal transfers and one sales order. These source records are not certified opening balances. Two completed source transfers lack matching transfer events in the supplied ledger and remain flagged for reconciliation.

All operating job cards, lots, expiry dates, recipes, quality evidence, example suppliers, bank references and payments are hypothetical. Recipes and inspection prompts are not manufacturing instructions or validated acceptance criteria. The workbook notification email and local hosting credentials are excluded from this repository.

Read [the build blueprint](blueprint.md) for confirmed project decisions, recommendations, remaining validation, proposed production architecture and the functionality not yet implemented. Project design confirmation is distinct from formal client-approved policy. The historical v0.9 register was unavailable for complete comparison.

## Source layout

- `index.html`, `app.js`, `core.js`, `styles.css`: modular browser application.
- `source-data.json`: selected workbook source data, excluding settings.
- `Goldsmith_Chocosmith_Prototype.html`: generated self-contained offline application.
- `blueprint.md`: implementation blueprint and acceptance scenarios.
- `checks.mjs`: domain assertions.
- `checks-ui.mjs`: screen and dialog render-path checks using a document stub.
- `VERIFICATION.md`: verification scope and known limitations.

No dependencies or build step are required. Serve the root directory using a static web server for the modular version. A current Node.js runtime can run the source checks:

```sh
node checks.mjs
node checks-ui.mjs
```

25 domain assertions and 28 screen/form checks passed. Browser visual QA remains unverified; see VERIFICATION.md. The standalone initial render was also checked with a document stub.

## GitHub Pages setup

In repository Settings → Pages, select **Deploy from a branch**, choose **main**, then **/ (root)** and save. The repository must remain public for the intended public demonstration. A successful Pages build supplies the final website URL.

## Next production build

Replace demonstration access with server-enforced named identities, add a transactional database and append-only ledgers, store evidence securely, implement notification delivery and concurrent posting controls, validate recipe and quality data, reconcile migration balances, and pilot with real users before live operations.

Public availability does not make this a production ERP. No software licence has been selected; publication alone does not grant an open-source licence.
