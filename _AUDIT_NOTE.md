# Audit Apply Note — AICarbonCreditMarketplaceVerifier

Source: `_AUDIT/reports/batch_01.md` § 14.

## Audit findings vs. reality
The audit reported "0 AI endpoints" but `routes/aiNew.js` exposes 7 AI endpoints:
- `/additionality-validator`, `/vintage-analyzer`, `/market-predictor`, `/compliance-reporter`, `/certification-tracker`, `/impact-verifier`, `/supply-chain-tracer`

So "Missing AI Layer" is incorrect. Other gaps remain valid (notifications, reporting, integration API).

## Implemented in this pass (MECHANICAL)

| # | Item | File | Endpoints |
|---|------|------|-----------|
| 1 | Webhook subscription stub | `server/routes/webhooks.js` (new) + `server/index.js` | `GET/POST/DELETE /api/webhooks`, `POST /api/webhooks/:id/test`, `GET /api/webhooks/_/events` |

Uses raw `sequelize.query` for the lazy webhooks table to avoid touching the existing Sequelize model registry. Allowed events: credit.created/verified/retired, transaction.completed, project.added, verification.passed/rejected, compliance.report_generated, market_data.updated. Payload-only test (no outbound HTTP). `node --check` passes.

## Backlog (not implemented)

| Item | Tag | Why deferred |
|------|-----|---------------|
| Email/SMS/push notifications | NEEDS-CREDS | SMTP / Twilio / FCM |
| Reporting / export | TOO-RISKY | Templates + UI |
| Outbound webhook delivery | TOO-RISKY | Background job infra |
| Verra / Gold Standard / VCS registry integration | NEEDS-CREDS | Registry API access |
| Multi-agent orchestration | NEEDS-PRODUCT-DECISION | Agent topology |

## Apply pass 3 (frontend)

- **Stack:** Express + React (CRA) under `client/`.
- **Action:** LEFT-AS-IS (FE already wired).
- **Verification:** `client/src/pages/AIStudio.js` covers the 7 endpoints in `server/routes/aiNew.js` (`additionality-validator`, `vintage-analyzer`, `market-predictor`, `compliance-reporter`, `certification-tracker`, `impact-verifier`, `supply-chain-tracer`) plus `buyer-recommend`. `AIHub.js` covers the older AI helpers; `Webhooks.js` covers the webhook subscription router added in pass 2. JWT bearer header is set by `client/src/services/api.js` reading `localStorage.getItem('token')`; 503-no-key responses surface in the result panel.
- **Files modified:** none.

## Apply pass 4 (mechanical backlog)

- **Action:** LEFT-AS-IS.
- **Features added:** none.
- **Reason:** The original audit's gap list (notifications, reporting, integration API) maps entirely to the existing backlog above — Email/SMS/push (NEEDS-CREDS), reporting/export (TOO-RISKY), outbound webhook delivery (TOO-RISKY), Verra/Gold-Standard/VCS registry integrations (NEEDS-CREDS), multi-agent orchestration (NEEDS-PRODUCT-DECISION). No remaining mechanical items can be added without credentials, product decisions, or background-job infrastructure.
- **Files modified:** none.
