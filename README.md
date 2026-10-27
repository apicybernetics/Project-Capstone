# Project Management Outlook
## Enterprise Project Management, Cost Control, Billing, Collection & Forecasting System

A comprehensive, production-grade enterprise web application for capital construction and engineering projects built according to ANSI/EIA-748 Earned Value Management (EVM) standards and the 10-phase capital project lifecycle workflow.

---

## 1. System Architecture & Workflow

1. **User Authentication & RBAC**: Multi-role governance (System Administrator, Project Manager, Project Engineer, Finance Officer, Billing & Collection Officer, Executive Viewer).
2. **Project Setup & Registration**: Unique ID, Code, Name, Client, Location, Contract Value, Start/End Dates, Team.
3. **Project Baseline Encoding**: Work breakdown structure (WBS), approved budget (BAC), milestone schedule, and billing schedule. Enforces completeness audit prior to approval.
4. **Periodic Project Updates**: Monthly actual physical progress, costs incurred (AC), committed costs, billing submitted/approved, cash collections received, outstanding accounts receivable.
5. **Data Validation & Integrity**: Non-destructive updates, 0-100% bounds checking, sequence validation, and audit log entries.
6. **Processing & Performance Analysis**: Authoritative EVM formulas (EV, PV, AC, BAC, SV, CV, SPI, CPI, EAC, ETC, VAC) and diagnostic RAG health indicators.
7. **Forecasting & AI Insights**: Progress S-Curve extrapolation (Baseline, Current Trend, Optimistic, Pessimistic scenarios), schedule slippage in days, cost overrun analysis, and automated mitigation advice.
8. **Executive Dashboards & Decision Support**: Portfolio overview, KPI metrics, status donut charts, cost performance bar charts, receivables aging, standard reports, and Excel/CSV/PDF exports.
9. **Project Closeout & Archive**: 10-point statutory closeout checklist, final cost reconciliation, retention bonds, and lessons learned.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend Infrastructure**: Google Firebase modular SDK:
  - **Cloud Firestore**: Primary NoSQL database (`projects`, `baselines`, `updates`, `documents`, `auditLogs`, `notifications`).
  - **Firebase Authentication**: User accounts, Google & OAuth sign-in, RBAC security claims.
  - **Firebase Storage**: Engineering drawings, signed contracts, progress photos, and certificates.
  - **Cloud Functions**: Privileged baseline approval, automated anomaly notification triggers, and closeout enforcement.
  - **Dual Persistence Architecture**: Operates with live Cloud Firestore when credentials are provided, with zero-setup browser persistence engine for offline/evaluation modes.

---

## 3. Local Development & Testing

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

### Running with Firebase Emulator Suite

```bash
# Start Firebase Local Emulators for Firestore, Auth, and Storage
firebase emulators:start
```

---

## 4. Security Configuration

- **`firestore.rules`**: Implements fine-grained RBAC and guarantees that approved baseline revisions are immutable.
- **`firestore.indexes.json`**: Composite indexes for portfolio filtering and descending timestamp sorting.
- **`storage.rules`**: Restricts uploads to authenticated team members, enforces 50MB file size limits, and checks MIME types.
