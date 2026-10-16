# Saraswat Co-operative Bank Ltd. - Digital Payments Reconciliation Platform
## System Design Document

**Version:** 1.0  
**Date:** 2026-10-15  
**Status:** Draft  
**Prepared for:** Saraswat Co-operative Bank Ltd.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Module Breakdown](#3-module-breakdown)
4. [Data Flow](#4-data-flow)
5. [Technology Stack](#5-technology-stack)
6. [Performance & Scalability](#6-performance--scalability)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. Executive Summary

The Digital Payments Reconciliation Platform is an enterprise-grade, production-ready system designed to replace the outsourced vendor (M/s ISG) for Saraswat Co-operative Bank Ltd. The platform provides automated reconciliation, dispute management, TTUM generation, and GL balancing across multiple payment products with daily volumes of ~14 lakh transactions (target capacity: 42 lakh/day).

### Key Objectives

- **In-house Operations:** Bring all reconciliation operations in-house with two operating modes (vendor-managed vs bank-managed)
- **Multi-Product Support:** Handle 11 payment product families with configurable, plug-in architecture
- **Regulatory Compliance:** RBI/NPCI compliant with audit trails, TAT tracking, and compensation calculations
- **High Performance:** Reconcile 14 lakh+ transactions in under 30 minutes
- **Automation:** Rule-driven exception handling, TTUM generation, and GL balancing

### Scope of Products

| Product | Daily Volume | Recon Mode |
|---------|-------------|------------|
| UPI | 13,00,000 | 3-way (CBS/Switch/Network) |
| IMPS | 46,000 | 3-way |
| AEPS | 100 | 3-way |
| BBPS | 1,000 | 2-way/3-way |
| NETC (FASTag) | 2,000 | 3-way |
| Payment Gateway | 1,000 | 3-way |
| RuPay | 3,000 | 3-way |
| VISA | 7,000 | 3-way |
| NFS Issuer | 30,000 | 3-way |
| NFS Acquirer | 9,500 | 3-way |
| Gift Card | 400 | 2-way |

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SYSTEMS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   CBS    │  │  SFTP    │  │   NPCI   │  │   VISA   │  │  Banks   │     │
│  │  System  │  │ Server   │  │  Portal  │  │  Clearing│  │/Operators│     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
└───────┼────────────┼────────────┼────────────┼────────────┼────────────────┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ SFTP Poller      │  │ Manual Upload    │  │ API Ingestion    │          │
│  │ Service          │  │ Service          │  │ Service          │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
└───────────┼─────────────────────┼─────────────────────┼────────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER (Microservices)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ File         │  │ Parser &     │  │ Matching     │  │ Exception    │   │
│  │ Ingestion    │  │ Normalisation│  │ Engine       │  │ Management   │   │
│  │ Service      │  │ Service      │  │ Service      │  │ Service      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ TTUM         │  │ GL Balancing │  │ Dispute &    │  │ Settlement  │   │
│  │ Generator    │  │ Engine       │  │ Chargeback   │  │ Verification │   │
│  │ Service      │  │ Service      │  │ Service      │  │ Service      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ PostgreSQL   │  │ Redis        │  │ Object       │  │ Message      │   │
│  │ (Primary DB) │  │ (Cache)      │  │ Storage      │  │ Queue        │   │
│  │              │  │              │  │ (Raw Files)  │  │ (Kafka/RMQ)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ REST API     │  │ Scheduler    │  │ Config       │  │ Admin        │   │
│  │ Gateway      │  │ (Airflow/    │  │ Engine       │  │ Console      │   │
│  │              │  │ Quartz)      │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Web UI       │  │ Branch       │  │ ODR API      │  │ Mobile       │   │
│  │ (React)      │  │ Portal       │  │ Integration  │  │ Banking API  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Flow

```
[File Arrival] → [SFTP Poller] → [File Validation] → [File Register]
                                            ↓
                                    [Raw File Storage]
                                            ↓
                                    [Parser Service]
                                            ↓
                                    [Normalised Schema]
                                            ↓
                                    [Matching Engine]
                                    /        |        \
                                   /         |         \
                         [Matched]  [Exception Queue]  [Partial Match]
                              |           |              |
                              ↓           ↓              ↓
                      [Recon Result]  [Exception Mgmt]  [Manual Review]
                              |           |
                              ↓           ↓
                      [GL Engine]  [TTUM Generator]
                              |           |
                              └─────┬─────┘
                                    ↓
                            [TTUM Batch]
                                    ↓
                            [Maker-Checker]
                                    ↓
                            [CBS Upload]
                                    ↓
                            [CBS Feedback]
                                    ↓
                            [GL Balance Report]
```

---

## 3. Module Breakdown

### 3.1 File Ingestion Service

**Purpose:** Detect, validate, register, and stage incoming files from multiple sources.

**Key Functions:**
- SFTP directory polling per product and source
- Manual file upload through UI
- File validation (name pattern, checksum, header/trailer, encoding)
- Duplicate detection (SHA-256 + filename + business date)
- File registration in `file_register` table
- Raw file storage (immutable)
- Archive and retention management
- Missing file alerts based on expected-file calendar

**Technical Specifications:**
- **Language:** Java (Spring Boot) or Python (FastAPI)
- **SFTP Library:** Apache Commons SSH (Java) or Paramiko (Python)
- **Polling Interval:** Configurable (default: 5 minutes)
- **Concurrency:** Parallel processing per product
- **Storage:** Object storage (MinIO/S3) or filesystem with partitioning

**Input:**
- SFTP connection details (host, port, credentials, directories)
- File configuration (regex patterns, expected fields, delimiters)

**Output:**
- `file_register` record
- Raw file in storage
- Validation status
- Alert notifications

---

### 3.2 Parser and Normalisation Service

**Purpose:** Transform product-specific file formats into the common normalized transaction schema.

**Key Functions:**
- Config-driven field mapping per product and source
- Support for multiple formats: CSV, fixed-width, XML, JSON, Excel
- Data type conversion and validation
- Status code mapping (source-specific → standard status)
- Amount normalization (handling decimals, currency conversion)
- Date/time standardization (IST)
- PII masking (PAN, Aadhaar, account numbers)
- Reject record handling with reason codes

**Technical Specifications:**
- **Framework:** Spring Batch (Java) or Apache Spark (Python) for large files
- **Schema:** Configuration-driven from `file_config` table
- **Error Handling:** Partial success (threshold-based) vs complete failure
- **Performance:** Chunked streaming reads (10,000 records/chunk)

**Input:**
- Raw file path
- Product and source identifiers
- Configuration from `file_config`

**Output:**
- `txn_normalised` records
- `reject_records` (for bad rows)
- File status update (SUCCESS/PARTIAL/FAILED)

---

### 3.3 Matching Engine

**Purpose:** Perform N-way reconciliation (2-way, 3-way, 4-way) with configurable match keys and rules.

**Key Functions:**
- N-way cross-verification (CBS ↔ Switch ↔ Network ↔ Wallet)
- Hierarchical match keys (primary → fallback → fuzzy)
- Parallel processing by product, date, and cycle
- Hash-based partitioning for performance
- Exception classification with configurable rules
- Auto-match with confidence scoring
- Cycle-wise and day-level roll-ups
- Reconciliation versioning (support re-runs)

**Technical Specifications:**
- **Algorithm:** Hash-based lookups with configurable key composition
- **Partitioning:** By `business_date` and `product`
- **Parallelism:** Thread pool or Spark partitions
- **Performance Target:** 14 lakh txns in < 30 minutes
- **Memory:** Streaming with pagination to avoid OOM

**Match Key Hierarchy:**
1. **Primary Key:** e.g., `RRN + amount + date`
2. **Fallback Key:** e.g., `STAN + account + amount + time_window`
3. **Fuzzy Match:** Amount tolerance ±₹1, time window ±5 minutes

**Exception Classification:**
- EX01: Debited in CBS, failed at network
- EX02: Debited in CBS, network missing/failed
- EX03: Network success, CBS not posted
- EX04: Amount mismatch
- EX05: Duplicate posting
- EX06: Network settled, bank failed
- EX07: Switch record missing
- EX08: Status mismatch (timeout/deemed)
- EX09: Wrong reversal

**Input:**
- Normalised transactions from all sources
- Match rule configuration
- Business date and cycle

**Output:**
- `recon_result` (txn-level match status)
- `recon_summary` (aggregated counts/amounts)
- `exception_history` (for unmatched records)

---

### 3.4 Exception Management Service

**Purpose:** Classify, age, queue, and manage unmatched transactions with workflow.

**Key Functions:**
- Exception classification and tagging
- Ageing calculation (T+1, T+2, 3-7 days, 7+ days)
- TAT deadline tracking with escalation alerts
- Owner assignment (L1/L2/L3 based on exception type)
- Workflow status (OPEN → TTUM-GENERATED → POSTED → DISPUTE → CLOSED)
- Queue management (by product, exception type, ageing)
- Bulk operations (mass TTUM generation, mass closure)
- Exception comments and attachments

**Technical Specifications:**
- **State Machine:** Configurable workflow per exception type
- **TAT Calculation:** Based on product-specific SLAs
- **Escalation:** Automatic escalation at TAT breach
- **Notifications:** Email/SMS alerts based on rules

**Input:**
- Unmatched records from matching engine
- Exception configuration rules

**Output:**
- `exception_history` records
- Workflow state updates
- Notification triggers

---

### 3.5 TTUM Generator

**Purpose:** Generate Dr/Cr entries for unmatched transactions with maker-checker workflow.

**Key Functions:**
- Rule-driven TTUM generation (product × exception_type × side)
- Idempotency check (same RRN + type already has TTUM?)
- Account validation (status check via CBS API or master file)
- GL mapping lookup
- TTUM batch creation with control checks
- Maker-checker workflow (mandatory separation)
- CBS-format export (configurable per CBS)
- CBS upload (manual or API)
- CBS feedback processing
- Re-generation support (versioned history)

**Technical Specifications:**
- **Batch Control:** Dr total = Cr total (block if mismatch)
- **Value Date:** Calculated per product and TAT
- **Narration Format:** `{PRODUCT} {REV/CR/ADJ} RRN {rrn} DT {ddmmyyyy}`
- **Account Handling:** Frozen/closed/invalid → suspense/unclaimed GL
- **Manual TTUM:** For exceptional cases with mandatory reason

**TTUM Record Fields:**
- Serial no
- Account/GL no
- Dr/Cr
- Amount
- Value date
- Particulars (narration)
- RRN/Reference
- Branch code
- Product code
- Batch ID

**Input:**
- Exception records
- TTUM rule configuration
- GL mapping
- Account validation data

**Output:**
- `ttum_batch` records
- `ttum_entry` records
- CBS export file
- Upload status

---

### 3.6 GL Balancing Engine

**Purpose:** Verify GL balances and explain differences between expected and actual balances.

**Key Functions:**
- Daily GL balance calculation
- Opening balance + matched + TTUM + suspense = expected closing
- Difference analysis (expected vs actual from CBS)
- Auto-tagged difference reasons
- Product-wise and GL-wise reporting
- Settlement verification (NPCI vs bank settlement account)
- Day close with approval workflow
- Historical trend analysis

**Technical Specifications:**
- **GL Mapping:** Configurable per product (settlement GL, suspense GL, chargeback GL, etc.)
- **Difference Reasons:** TTUM pending/failed, timing difference, manual CBS entries, wrong mapping, fees booked separately
- **Settlement Verification:** Cycle-wise NPCI settlement vs bank account movement
- **Day Close:** Lock after approval; later corrections as dated adjustments

**Input:**
- GL mapping configuration
- Recon summary
- TTUM status
- CBS GL balance file/API
- NPCI settlement reports

**Output:**
- `gl_balance_daily` records
- `gl_difference` records
- GL balancing report
- Settlement verification report

---

### 3.7 Dispute and Chargeback Management

**Purpose:** Handle chargeback, pre-arbitration, and ODR complaints with NPCI integration.

**Key Functions:**
- Branch portal for raising disputes
- Central data pull for NPCI submission
- Customer ODR API integration
- Mobile banking API integration
- Auto-population from recon data (by RRN)
- Duplicate dispute detection
- Lifecycle management (Raised → Validated → Filed → Accepted/Rejected → Pre-arbitration → Arbitration → Closed)
- TAT timers and escalation
- Evidence upload and management
- NPCI submission (API or portal-assisted)
- Incoming dispute handling (as acquirer/beneficiary)
- Accounting linkage (dispute outcomes → TTUM)
- MIS reports (ageing, TAT compliance, success rate)

**Technical Specifications:**
- **Portal:** React/Angular web application
- **API:** REST with OpenAPI documentation
- **Authentication:** API key/OAuth2 for external integrations
- **Rate Limiting:** Configurable per API key
- **Idempotency:** Idempotency key for duplicate prevention
- **Notifications:** SMS/email on status changes

**Input:**
- Dispute requests (branch, ODR, mobile)
- Recon data (for auto-population)
- NPCI submission data

**Output:**
- `dispute_case` records
- `dispute_history` records
- `dispute_document` records
- `npci_submission` records
- TTUM entries (on resolution)

---

### 3.8 Settlement Verification Service

**Purpose:** Verify NPCI/network settlement amounts against bank settlement account movements.

**Key Functions:**
- NPCI settlement report parsing
- Bank settlement account reconciliation
- Cycle-wise net settlement comparison
- Difference identification and reporting
- Multi-product support (UPI, IMPS, NFS, RuPay, VISA, NETC)

**Technical Specifications:**
- **Settlement Accounts:** Configurable per product
- **Currency:** Multi-currency support for VISA (store txn currency, billing currency, INR)
- **Forex:** VISA daily rate application and forex difference calculation

**Input:**
- NPCI settlement reports
- Bank settlement account statements
- Exchange rates (for forex)

**Output:**
- Settlement verification report
- Difference records
- Forex difference entries

---

### 3.9 Reporting and MIS

**Purpose:** Generate regulatory, operational, and audit reports.

**Key Functions:**
- Daily recon summary by product
- Unmatched/exception reports with ageing
- TTUM register (generated, posted, failed)
- GL balancing and difference report
- Settlement reconciliation report
- Dispute reports and NPCI TAT compliance
- RBI compliance reports (failed transaction TAT, compensation)
- File-receipt tracker (expected vs received)
- Audit reports (user actions, approvals, overrides)
- Dashboard (UI with real-time metrics)
- Scheduled report delivery (email, PDF, Excel, CSV)

**Technical Specifications:**
- **Framework:** JasperReports (Java) or ReportLab (Python)
- **Formats:** PDF, Excel, CSV, HTML
- **Scheduling:** Quartz scheduler or Airflow
- **Delivery:** Email, SFTP, API download

**Report Types:**
1. **Operational Reports:** Daily, weekly, monthly summaries
2. **Regulatory Reports:** RBI compliance, NPCI TAT
3. **Audit Reports:** User activity, approval trail
4. **MIS Reports:** Exception ageing, GL trends, dispute analytics

---

### 3.10 Admin and Configuration

**Purpose:** Manage configuration, users, roles, and system settings.

**Key Functions:**
- Product configuration (add/remove products, parsers)
- File format configuration (regex, field mapping, delimiters)
- Match rule configuration (keys, hierarchies, fuzzy matching)
- TTUM rule configuration (exception → action mapping)
- GL mapping configuration (settlement GL, suspense GL, etc.)
- User and role management (RBAC)
- Permission management (module-level access)
- Expected-file calendar (product × source × cycle)
- SLA configuration (TAT per product/exception type)
- Notification rules (alert triggers, recipients)

**Technical Specifications:**
- **UI:** React/Angular admin console
- **Validation:** Rule validation before save
- **Versioning:** Configuration versioning with rollback
- **Audit:** All configuration changes logged

---

### 3.11 Audit and Security Layer

**Purpose:** Provide immutable audit trail and security controls.

**Key Functions:**
- Immutable audit log for all critical operations
- File operations (ingest, parse, archive)
- Reconciliation operations (match, exception, TTUM)
- User actions (login, logout, approval, override)
- Configuration changes
- Security controls (RBAC, MFA, encryption)
- PII/PCI compliance (masking, encryption)

**Technical Specifications:**
- **Audit Fields:** timestamp, user, action, entity_id, old_value, new_value, ip_address
- **Storage:** Separate audit database (read-only after write)
- **Retention:** Per bank policy (typically 5-10 years)
- **Encryption:** AES-256 at rest, TLS in transit
- **Key Management:** HSM/KMS for encryption keys

---

## 4. Data Flow

### 4.1 End-to-End Data Flow (UPI Example)

```
1. FILE ARRIVAL
   ┌─────────────────────────────────────────────┐
   │ SFTP: /inbound/UPI/CBS/20261015/           │
   │ SFTP: /inbound/UPI/SWITCH/20261015/        │
   │ SFTP: /inbound/UPI/NPCI/20261015/           │
   └─────────────────────────────────────────────┘
                    ↓
2. FILE INGESTION
   ┌─────────────────────────────────────────────┐
   │ - Validate filename pattern                 │
   │ - Calculate SHA-256 checksum                 │
   │ - Check duplicate (checksum + name + date)  │
   │ - Validate header/trailer count             │
   │ - Register in file_register                 │
   │ - Store raw file in object storage          │
   └─────────────────────────────────────────────┘
                    ↓
3. PARSING & NORMALISATION
   ┌─────────────────────────────────────────────┐
   │ - Read file config from DB                  │
   │ - Parse CSV/fixed-width/XML                 │
   │ - Map fields to common schema               │
   │ - Convert status codes                      │
   │ - Normalize amounts and dates               │
   │ - Mask PII (PAN, account)                   │
   │ - Write to txn_normalised                   │
   │ - Write rejects to reject_records           │
   └─────────────────────────────────────────────┘
                    ↓
4. MATCHING ENGINE
   ┌─────────────────────────────────────────────┐
   │ - Load normalised records (CBS, Switch, NPCI)│
   │ - Build hash tables by match key             │
   │ - Perform 3-way match                        │
   │ - Apply hierarchy (primary → fallback)      │
   │ - Classify exceptions                        │
   │ - Write recon_result                        │
   │ - Write recon_summary                        │
   │ - Write exception_history                    │
   └─────────────────────────────────────────────┘
                    ↓
5. EXCEPTION MANAGEMENT
   ┌─────────────────────────────────────────────┐
   │ - Ageing calculation (T+1, T+2, etc.)       │
   │ - TAT deadline tracking                     │
   │ - Owner assignment                          │
   │ - Queue by product and exception type        │
   │ - Trigger TTUM generation for auto-eligible  │
   └─────────────────────────────────────────────┘
                    ↓
6. TTUM GENERATION (for unmatched)
   ┌─────────────────────────────────────────────┐
   │ - Lookup TTUM rule (product × exception)     │
   │ - Check idempotency (same RRN + type)       │
   │ - Validate account status                   │
   │ - Map GL accounts                           │
   │ - Create TTUM batch                          │
   │ - Maker submits → Checker approves          │
   │ - Export CBS format file                    │
   │ - Upload to CBS (manual/API)                │
   │ - Process CBS feedback                      │
   └─────────────────────────────────────────────┘
                    ↓
7. GL BALANCING
   ┌─────────────────────────────────────────────┐
   │ - Calculate expected closing balance         │
   │   (Opening + Matched + TTUM + Suspense)     │
   │ - Fetch actual CBS GL balance                │
   │ - Calculate difference                      │
   │ - Auto-tag reason (TTUM pending, timing, etc)│
   │ - Generate GL report                         │
   └─────────────────────────────────────────────┘
                    ↓
8. SETTLEMENT VERIFICATION
   ┌─────────────────────────────────────────────┐
   │ - Parse NPCI settlement report              │
   │ - Compare per-cycle net settlement          │
   │ - Verify against bank settlement account     │
   │ - Flag differences                          │
   └─────────────────────────────────────────────┘
                    ↓
9. REPORTING
   ┌─────────────────────────────────────────────┐
   │ - Daily recon summary                       │
   │ - Exception ageing report                   │
   │ - TTUM register                             │
   │ - GL balancing report                       │
   │ - Settlement verification report            │
   │ - Scheduled delivery (email/portal)         │
   └─────────────────────────────────────────────┘
```

### 4.2 Dispute Flow

```
1. DISPUTE RAISED
   ┌─────────────────────────────────────────────┐
   │ Branch Portal / ODR API / Mobile API        │
   │ - User provides RRN or details              │
   │ - Auto-populate from recon data             │
   │ - Check duplicate dispute for same RRN      │
   │ - Attach evidence documents                 │
   └─────────────────────────────────────────────┘
                    ↓
2. VALIDATION
   ┌─────────────────────────────────────────────┐
   │ - Validate RRN exists in recon data         │
   │ - Check dispute type eligibility            │
   │ - Verify within TAT window                  │
   │ - Assign to dispute handler                 │
   └─────────────────────────────────────────────┘
                    ↓
3. FILING
   ┌─────────────────────────────────────────────┐
   │ - Format for NPCI submission                 │
   │ - Submit via NPCI API or portal-assisted     │
   │ - Track NPCI reference number                │
   └─────────────────────────────────────────────┘
                    ↓
4. PROCESSING
   ┌─────────────────────────────────────────────┐
   │ - NPCI processes dispute                     │
   │ - Bank provides evidence if needed           │
   │ - Track TAT deadlines                        │
   │ - Escalate if breach                         │
   └─────────────────────────────────────────────┘
                    ↓
5. RESOLUTION
   ┌─────────────────────────────────────────────┐
   │ Accepted:                                    │
   │   - Generate TTUM (credit customer)          │
   │   - Post to chargeback GL                   │
   │ Rejected:                                    │
   │   - Generate TTUM (recovery if applicable)  │
   │   - Update dispute status                    │
   └─────────────────────────────────────────────┘
                    ↓
6. NOTIFICATION
   ┌─────────────────────────────────────────────┐
   │ - Notify customer (SMS/email)               │
   │ - Update dispute history                    │
   │ - Close case                                 │
   └─────────────────────────────────────────────┘
```

---

## 5. Technology Stack

### 5.1 Backend Services

**Option A: Java (Spring Boot)**
- **Framework:** Spring Boot 3.x, Spring Batch, Spring Security
- **Database:** PostgreSQL 15+ (partitioned) or Oracle 19c+
- **Cache:** Redis 7+
- **Queue:** Apache Kafka 3.x or RabbitMQ 3.12+
- **Scheduler:** Quartz Scheduler or Apache Airflow
- **SFTP:** Apache Commons SSH
- **Reporting:** JasperReports
- **Build:** Maven or Gradle

**Option B: Python (FastAPI)**
- **Framework:** FastAPI, Celery (for async tasks)
- **Database:** PostgreSQL 15+ (partitioned) with SQLAlchemy
- **Cache:** Redis 7+
- **Queue:** Apache Kafka 3.x or RabbitMQ 3.12+
- **Scheduler:** Apache Airflow
- **SFTP:** Paramiko
- **Batch Processing:** Apache Spark (PySpark) for large files
- **Reporting:** ReportLab, WeasyPrint
- **Build:** Poetry or pip

**Recommendation:** Java (Spring Boot) for enterprise banking environment, robust ecosystem, and easier integration with existing bank systems.

### 5.2 Frontend

- **Framework:** React 18+ or Angular 17+
- **UI Library:** Material-UI, Ant Design, or Tailwind CSS
- **Charts:** Recharts, Chart.js, or ApexCharts
- **State Management:** Redux Toolkit or Zustand
- **Build:** Vite or Webpack

### 5.3 Database

**Primary Database:** PostgreSQL 15+
- Partitioning by `business_date` and `product`
- Indexes on match keys, dates, status fields
- Full-text search for audit logs
- JSONB for configuration storage

**Alternative:** Oracle 19c+ (if bank mandates)

**Cache:** Redis 7+
- Session storage
- Cached reference data (GL mapping, user permissions)
- Rate limiting

**Object Storage:** MinIO (self-hosted S3-compatible) or AWS S3
- Raw file storage
- Archive storage
- Backup storage

### 5.4 Message Queue

**Option A: Apache Kafka 3.x**
- High throughput for file events
- Event streaming for real-time updates
- Exactly-once semantics

**Option B: RabbitMQ 3.12+
- simpler setup
- Good for job queues
- Reliable message delivery

**Recommendation:** Kafka for scalability and event-driven architecture.

### 5.5 Scheduler

**Option A: Apache Airflow**
- Complex DAG orchestration
- Visual workflow management
- Good for ETL pipelines

**Option B: Quartz Scheduler (embedded in Spring Boot)**
- Simpler for cron-like scheduling
- Native Java integration
- Lower operational overhead

**Recommendation:** Quartz for this use case (simpler, sufficient for scheduled jobs).

### 5.6 Deployment

**Containerisation:** Docker
- Multi-stage builds
- Docker Compose for local dev
- Kubernetes for production

**Orchestration:** Kubernetes 1.28+
- Horizontal Pod Autoscaling
- ConfigMaps and Secrets
- Ingress controllers (NGINX/Traefik)

**CI/CD:** Jenkins, GitLab CI, or GitHub Actions
- Automated builds
- Automated testing
- Automated deployment

### 5.7 Security

- **TLS:** Everywhere (TLS 1.3)
- **Encryption:** AES-256 at rest
- **Key Management:** HSM or KMS (HashiCorp Vault, AWS KMS)
- **Authentication:** LDAP/Active Directory integration, SSO (SAML/OIDC)
- **Authorization:** RBAC with fine-grained permissions
- **MFA:** TOTP-based (Google Authenticator, etc.)
- **Audit:** Immutable audit log
- **VAPT:** OWASP ZAP, Burp Suite

### 5.8 Monitoring and Observability

- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- **Metrics:** Prometheus + Grafana
- **Tracing:** OpenTelemetry + Jaeger
- **Alerting:** Alertmanager, PagerDuty
- **Health Checks:** Spring Boot Actuator or FastAPI health endpoints

---

## 6. Performance & Scalability

### 6.1 Performance Targets

| Metric | Target |
|--------|--------|
| Full-day recon (14 lakh txns) | < 30 minutes |
| UI list screen response | < 3 seconds (with pagination) |
| File ingestion (1GB file) | < 5 minutes |
| TTUM generation (10,000 entries) | < 2 minutes |
| GL balancing (daily) | < 5 minutes |
| API response time | < 500ms (p95) |

### 6.2 Scalability Strategy

**Horizontal Scaling:**
- Stateless microservices
- Kubernetes HPA based on CPU/memory
- Database connection pooling

**Database Partitioning:**
- Partition by `business_date` (range partitioning)
- Sub-partition by `product` (list partitioning)
- Indexes on frequently queried columns

**Caching:**
- Redis for reference data (GL mapping, file config)
- Application-level caching for user sessions
- CDN for static assets

**Batch Processing:**
- Chunked file reads (10,000 records/chunk)
- Parallel processing by product and date
- Bulk database operations (batch inserts/updates)

**Queue Backpressure:**
- Consumer group scaling
- Dead letter queues for failed messages
- Circuit breakers for external service calls

### 6.3 Capacity Planning

**Current Volume:** ~14 lakh transactions/day
**Target Volume:** 42 lakh transactions/day (3x current)

**Resource Estimates (for 42 lakh/day):**
- **CPU:** 16 cores per service instance (3 instances = 48 cores)
- **Memory:** 32GB per service instance (3 instances = 96GB)
- **Database:** 64GB RAM, 1TB SSD storage (with partitioning)
- **Cache:** 16GB Redis cluster
- **Storage:** 10TB object storage (raw files + archives, 5-year retention)

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Network Security                                        │
│  - Firewall rules (ingress/egress)                       │
│  - Network segmentation (DMZ, internal, DB)            │
│  - TLS 1.3 everywhere                                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Application Security                                    │
│  - Authentication (LDAP/SSO/MFA)                       │
│  - Authorization (RBAC)                                  │
│  - Input validation                                      │
│  - OWASP Top 10 mitigation                               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Data Security                                           │
│  - Encryption at rest (AES-256)                         │
│  - Encryption in transit (TLS)                          │
│  - Key management (HSM/KMS)                              │
│  - PII masking (PAN, Aadhaar, account)                  │
│  - PCI DSS compliance                                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Audit & Compliance                                       │
│  - Immutable audit log                                   │
│  - User activity tracking                                │
│  - RBI/NPCI compliance                                    │
│  - VAPT ready                                             │
└─────────────────────────────────────────────────────────┘
```

### 7.2 PII/PCI Data Handling

**Masking Rules:**
- **PAN:** Show first 6 and last 4 digits (e.g., `XXXXXX7890`)
- **Aadhaar:** Never store full Aadhaar; store masked version only
- **Account Number:** Encrypt at rest; mask in UI/logs (last 4 digits)
- **Card Number:** Mask in UI/logs (first 6 + last 4)

**Encryption:**
- **Database:** Transparent Data Encryption (TDE) or application-level encryption
- **Object Storage:** Server-side encryption (SSE-S3 or SSE-KMS)
- **Logs:** No PII in logs; use masked references

**Access Control:**
- Role-based access to PII
- Audit log for all PII access
- Data retention policy (5-10 years per RBI)

### 7.3 Authentication & Authorization

**Authentication:**
- LDAP/Active Directory integration
- SSO via SAML 2.0 or OIDC
- MFA (TOTP-based)
- Session timeout (30 minutes)

**Authorization:**
- RBAC with roles (Admin, L1 Operator, L2 Handler, L3 Approver, Auditor)
- Fine-grained permissions (module-level)
- Maker-checker enforcement (same user cannot make and check)

### 7.4 Audit Trail

**Audit Events:**
- User login/logout
- File operations (ingest, parse, archive)
- Reconciliation operations (match, exception, TTUM)
- Configuration changes
- Approvals and overrides
- PII access

**Audit Record:**
- Timestamp
- User ID
- Action
- Entity ID
- Old value / New value
- IP address
- User agent

**Storage:**
- Separate audit database
- Read-only after write
- Retention per bank policy

---

## 8. Deployment Architecture

### 8.1 On-Premises Deployment (Preferred)

```
┌──────────────────────────────────────────────────────────────┐
│                      Data Center (Primary)                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Kubernetes  │  │ PostgreSQL   │  │ Redis Cluster│       │
│  │  Cluster     │  │ (Primary)    │  │              │       │
│  │  (3 nodes)   │  │ (2 nodes HA) │  │ (3 nodes)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Kafka Cluster│  │ MinIO        │  │ Elasticsearch │       │
│  │ (3 nodes)    │  │ (Object Store)│  │ + Kibana     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Async Replication)
┌──────────────────────────────────────────────────────────────┐
│                    Disaster Recovery Site                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Kubernetes  │  │ PostgreSQL   │  │ Redis Cluster│       │
│  │  Cluster     │  │ (Standby)    │  │ (Standby)    │       │
│  │  (2 nodes)   │  │ (Hot standby) │  │ (2 nodes)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 High Availability

**Kubernetes:**
- 3 control plane nodes
- 3+ worker nodes
- Pod anti-affinity (spread across nodes)
- HPA for auto-scaling

**Database:**
- PostgreSQL streaming replication (1 primary, 1 standby)
- Automatic failover (Patroni or pg_auto_failover)
- Connection pooling (PgBouncer)

**Cache:**
- Redis Cluster (3 master nodes + replicas)
- Automatic failover

**Queue:**
- Kafka cluster (3 brokers)
- Replication factor 3
- Zookeeper or KRaft mode

**Object Storage:**
- MinIO distributed mode (4+ nodes)
- Erasure coding

### 8.3 Disaster Recovery

**RPO (Recovery Point Objective):** < 5 minutes
**RTO (Recovery Time Objective):** < 1 hour

**Strategy:**
- Async replication from Primary to DR (PostgreSQL, Kafka, MinIO)
- Daily snapshot backups
- Weekly full backup + nightly incremental
- Monthly DR drill

**Failover Process:**
1. Detect primary site failure
2. Promote PostgreSQL standby to primary
3. Update DNS to point to DR site
4. Verify application health
5. Notify stakeholders

### 8.4 Backup Strategy

**Database:**
- Daily full backup (pg_dump or pg_basebackup)
- Hourly WAL archiving
- Retention: 30 days (daily), 12 months (weekly)

**Object Storage:**
- Versioning enabled
- Lifecycle policies (move to cold storage after 90 days)
- Cross-region replication (if using cloud)

**Configuration:**
- Git repository for config files
- Secrets in Vault (with backup)

### 8.5 Container Images

**Base Images:**
- Runtime: Eclipse Temurin JRE 17 (Java) or Python 3.11 slim
- OS: Alpine Linux or Distroless (minimal attack surface)

**Image Registry:**
- Private registry (Harbor, GitLab Registry)
- Image signing (Cosign)
- Vulnerability scanning (Trivy)

---

## 9. Integration Points

### 9.1 External Systems

| System | Integration Type | Protocol | Purpose |
|--------|-----------------|----------|---------|
| CBS | File Upload/API | SFTP/REST | TTUM upload, GL balance fetch |
| NPCI | Portal/API | HTTPS | Settlement reports, dispute filing |
| SFTP Server | File Pickup | SFTP | Counterparty file ingestion |
| Bank Website | API | REST/OAuth2 | ODR integration |
| Mobile Banking | API | REST/OAuth2 | Dispute management |
| Email Server | SMTP | SMTP | Notifications |
| SMS Gateway | API | REST | SMS alerts |

### 9.2 Internal Systems

| System | Integration Type | Protocol | Purpose |
|--------|-----------------|----------|---------|
| LDAP/AD | Authentication | LDAP | User authentication |
| HSM/KMS | Key Management | API/KMIP | Encryption key management |
| Monitoring | Metrics | Prometheus | Metrics collection |
| Logging | Logs | Loki/ELK | Log aggregation |

---

## 10. Assumptions & Dependencies

### 10.1 Bank Inputs (To Be Confirmed)

- [ ] CBS product and exact TTUM upload format
- [ ] Sample CBS, switch, and NPCI/network files for every product
- [ ] Bank's role (issuer/acquirer/both) for AEPS, NETC, BBPS, NFS
- [ ] GL account mapping and compensation rules
- [ ] Hosting model (bank DC / private cloud / vendor-hosted)
- [ ] NPCI dispute filing method (API vs portal-assisted)
- [ ] Volumes: peak vs average, growth forecast
- [ ] Owner of website ODR and mobile banking API integrations
- [ ] RPO/RTO requirements for DR
- [ ] Data retention policy (RBI/bank policy)

### 10.2 Technical Assumptions

- Bank uses PostgreSQL or Oracle (not MySQL)
- Bank has LDAP/Active Directory for user management
- Bank has HSM or KMS for key management
- Bank has existing SFTP infrastructure
- Bank uses container orchestration (Kubernetes) or can adopt it
- Network connectivity between DC and DR site is adequate

### 10.3 Business Assumptions

- Bank wants to replace ISG completely (not hybrid)
- Bank staff will operate the platform (at least in one mode)
- Bank has finance team to define GL mapping
- Bank has operations team to handle exceptions
- Bank has IT team to manage infrastructure

---

## 11. Next Steps

1. **Discovery Phase (2-3 weeks):**
   - Collect sample files from bank and NPCI
   - Confirm CBS TTUM format and GL mapping
   - Validate bank's role for each product
   - Confirm hosting model and RPO/RTO
   - Gap study against ISG scope

2. **Foundation Phase (3-4 weeks):**
   - Set up infrastructure (Kubernetes, PostgreSQL, Kafka, etc.)
   - Implement ingestion framework
   - Define common schema
   - Implement config engine
   - Set up security and audit

3. **Phase 1 - UPI & IMPS (6-8 weeks):**
   - Implement UPI parser and recon
   - Implement IMPS parser and recon
   - Implement TTUM generation for UPI/IMPS
   - Implement GL balancing for UPI/IMPS
   - Unit testing and integration testing

4. **Phase 2 - NFS, RuPay, VISA (4-6 weeks):**
   - Implement NFS Issuer/Acquirer recon
   - Implement RuPay recon
   - Implement VISA recon (with forex)
   - TTUM and GL for Phase 2 products

5. **Phase 3 - AEPS, BBPS, NETC, PG, Gift Card (3-4 weeks):**
   - Implement remaining products
   - Complete TTUM and GL for all products

6. **Dispute Module (6-8 weeks, parallel):**
   - Branch portal
   - ODR API integration
   - Mobile API integration
   - NPCI submission
   - Dispute workflow

7. **Reporting & UAT (2-3 weeks):**
   - Implement all reports
   - User acceptance testing
   - Performance testing
   - Security testing (VAPT)

8. **Parallel Run & Cutover (4-6 weeks):**
   - Parallel run with ISG (1-2 months)
   - Compare results
   - Address differences
   - Cutover to production
   - Hypercare support

**Total Estimated Duration:** 28-40 weeks (7-10 months)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| CBS | Core Banking System |
| TTUM | Transaction Adjustment Unit Memo |
| GL | General Ledger |
| TAT | Turnaround Time |
| RRN | Retrieval Reference Number |
| STAN | System Trace Audit Number |
| NPCI | National Payments Corporation of India |
| UPI | Unified Payments Interface |
| IMPS | Immediate Payment Service |
| AEPS | Aadhaar Enabled Payment System |
| BBPS | Bharat Bill Payment System |
| NETC | National Electronic Toll Collection |
| NFS | National Financial Switch |
| ODR | Online Dispute Resolution |
| RET | Reversal Entry |
| TCC | Transaction Charge/Claim |
| URCS | UPI Reconciliation and Settlement System |
| RBI | Reserve Bank of India |
| VAPT | Vulnerability Assessment and Penetration Testing |
| HSM | Hardware Security Module |
| KMS | Key Management Service |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| HA | High Availability |
| DR | Disaster Recovery |

---

## Appendix B: References

- NPCI UPI Technical Specifications
- NPCI IMPS Specifications
- NPCI NFS Specifications
- NPCI BBPS Specifications
- RBI Master Direction on Digital Payments
- PCI DSS Standards
- OWASP Top 10

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-15 | Devin | Initial draft |
