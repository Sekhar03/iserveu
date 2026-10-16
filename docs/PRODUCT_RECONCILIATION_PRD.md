# iServeU Financial Reconciliation Platform: Product Comparison & Reconciliation PRD

## 1. Executive Summary & Product Vision

The **iServeU Financial Reconciliation Platform** is an enterprise-grade financial integrity engine designed to automate multi-way transaction reconciliation across diverse payment verticals including **Agency Banking**, **Acquiring**, **Issuance**, and **Bharat Connect (BBPS)**.

This Product Requirements Document (PRD) establishes a comprehensive comparison of all **26 sub-products** supported by the platform. It details required source files, ingestion channels, column schemas, key matching criteria, N-way reconciliation topologies, settlement cycle windows, and exception resolution workflows.

---

## 2. Business Vertical & Product Taxonomy Comparison

The platform categorizes reconciliation operations into **4 Business Verticals**, spanning **10 Categories** and **26 Sub-Products**:

| Vertical Name | Category | Sub-Product Count | Key Sub-Products | Recon Topology | Primary Channels |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Agency Banking** | AEPS | 6 | Aadharpay, Fino AEPS, NSDL AEPS, IPPB AEPS, IPPB AEPS CD, IPPB Wallet | 4-Way | GCP Bucket, NPCI Portal |
| **Agency Banking** | MATM | 6 | MATM 4-Way, MATM 3-Way, MATM Commission, Equitas MATM, NSDL MATM, IPPB MATM | 3-Way & 4-Way | GCP Bucket, NPCI Portal |
| **Agency Banking** | DMT | 3 | Airtel DMT, Fino DMT, NSDL DMT | 3-Way | GCP Bucket, Bank SFTP |
| **Agency Banking** | Payout | 5 | Wallet2Cashout, W2Cashout IMPS, NSDL Cashout (4-Way), Axis Cashout, IPPB Cashout | 2-Way & 4-Way | GCP Bucket, Bank SFTP |
| **Agency Banking** | RECHARGE | 3 | Recharge Krack, Recharge Euro, Recharge Commission | 2-Way | GCP Bucket, Operator Portal |
| **Acquiring** | UPI | 2 | NSDL PA UPI, NSDL CASHPOINT | 2-Way & 4-Way | GCP Bucket, NPCI URCS |
| **Acquiring** | POS | 1 | POS Recon | 3-Way | GCP Bucket (Auto-Ingested) |
| **Issuance** | IMPS | 2 | NSDL IMPS, IPPB IMPS | 2-Way & 3-Way | GCP Bucket, Bank SFTP |
| **Issuance** | PREPAID CARD | 2 | TA Prepaid Card, TRANSCORP Prepaid Card | 4-Way | GCP Bucket (Auto-Ingested) |
| **Bharat Connect** | BHARAT CONNECT | 2 | Bharat Connect BOU, Bharat Connect COU | 3-Way | NPCI / CBS / Switch |

---

## 3. Product-Wise Required Files & Ingestion Matrix

Each sub-product requires a specific set of internal logs and counterparty settlement files. Below is the complete manifest for all 26 sub-products:

| Category | Sub-Product | Required File Name | File Type | Ingestion Channel | Default Volume |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **AEPS** | **Aadharpay** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 18,450 |
| | | Middleware Log | Internal | GCP Bucket | 18,450 |
| | | Wallet Log | Internal | GCP Bucket | 18,450 |
| | | Switch Log | Internal | GCP Bucket | 18,450 |
| **AEPS** | **Fino AEPS** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 12,300 |
| | | Fino Middleware Log | Internal | GCP Bucket | 12,300 |
| | | Fino Wallet Log | Internal | GCP Bucket | 12,300 |
| | | Fino Switch Log | Internal | GCP Bucket | 12,300 |
| **AEPS** | **NSDL AEPS** | NPCI Daily Settlement File | Counterparty | NPCI Clearing Portal / Manual | 15,800 |
| | | NSDL Middleware Log | Internal | GCP Bucket | 15,800 |
| | | NSDL Wallet Log | Internal | GCP Bucket | 15,800 |
| | | NSDL Switch Log | Internal | GCP Bucket | 15,800 |
| **AEPS** | **IPPB AEPS** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 9,400 |
| | | IPPB Middleware Log | Internal | GCP Bucket | 9,400 |
| | | IPPB Wallet Log | Internal | GCP Bucket | 9,400 |
| | | IPPB Switch Log | Internal | GCP Bucket | 9,400 |
| **AEPS** | **IPPB AEPS CD** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 8,200 |
| | | IPPB CD Middleware Log | Internal | GCP Bucket | 8,200 |
| | | IPPB CD Wallet Log | Internal | GCP Bucket | 8,200 |
| | | IPPB CD Switch Log | Internal | GCP Bucket | 8,200 |
| **AEPS** | **IPPB Wallet** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 10,500 |
| | | IPPB Middleware Log | Internal | GCP Bucket | 10,500 |
| | | IPPB Wallet Clearing Report | Internal | GCP Bucket | 10,500 |
| | | IPPB Wallet Switch Log | Internal | GCP Bucket | 10,500 |
| **MATM** | **MATM 4-Way** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 8,900 |
| | | Middleware Log | Internal | GCP Bucket | 8,900 |
| | | Wallet Log | Internal | GCP Bucket | 8,900 |
| | | Switch Log | Internal | GCP Bucket | 8,900 |
| **MATM** | **MATM 3-Way** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 7,400 |
| | | Middleware Log | Internal | GCP Bucket | 7,400 |
| | | Wallet Log | Internal | GCP Bucket | 7,400 |
| | | Switch Log | Internal | GCP Bucket | 7,400 |
| **MATM** | **MATM Commission** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 11,200 |
| | | Middleware Log | Internal | GCP Bucket | 11,200 |
| | | Wallet Log | Internal | GCP Bucket | 11,200 |
| | | Switch Log | Internal | GCP Bucket | 11,200 |
| **MATM** | **Equitas MATM** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 6,800 |
| | | Middleware Log | Internal | GCP Bucket | 6,800 |
| | | Wallet Log | Internal | GCP Bucket | 6,800 |
| | | Switch Log | Internal | GCP Bucket | 6,800 |
| **MATM** | **NSDL MATM** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 9,100 |
| | | Middleware Log | Internal | GCP Bucket | 9,100 |
| | | Wallet Log | Internal | GCP Bucket | 9,100 |
| | | Switch Log | Internal | GCP Bucket | 9,100 |
| **MATM** | **IPPB MATM** | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 8,300 |
| | | Middleware Log | Internal | GCP Bucket | 8,300 |
| | | Wallet Log | Internal | GCP Bucket | 8,300 |
| | | Switch Log | Internal | GCP Bucket | 8,300 |
| **IMPS** | **NSDL IMPS** | NSDL CBS Settlement File | Counterparty | NSDL SFTP / Manual | 16,500 |
| | | IMPS Middleware Log | Internal | GCP Bucket | 16,500 |
| | | IMPS Switch Journal | Internal | GCP Bucket | 16,500 |
| **IMPS** | **IPPB IMPS** | IPPB Settlement Report File | Counterparty | IPPB SFTP Node / Manual | 13,200 |
| | | IPPB IMPS Switch Log | Internal | GCP Bucket | 13,200 |
| **BHARAT CONNECT** | **Bharat Connect BOU** | NPCI File | Counterparty | Manual File Upload | 11,200 |
| | | CBS File | Counterparty | Manual File Upload | 11,200 |
| | | Switch File | Counterparty | Manual File Upload | 11,200 |
| **BHARAT CONNECT** | **Bharat Connect COU** | NPCI File | Counterparty | Manual File Upload | 14,200 |
| | | CBS File | Counterparty | Manual File Upload | 14,200 |
| | | Switch File | Counterparty | Manual File Upload | 14,200 |
| **RECHARGE** | **Recharge Krack** | Operator Recon Sheet | Counterparty | Operator Portal / Manual | 24,500 |
| | | Recharge Krack Switch Log | Internal | GCP Bucket | 24,500 |
| **RECHARGE** | **Recharge Euro** | Operator Recon Sheet (Euronet) | Counterparty | Euronet SFTP Node / Manual | 18,900 |
| | | Euronet Recharge Gateway Log | Internal | GCP Bucket | 18,900 |
| **RECHARGE** | **Recharge Comm.** | Operator Recon Sheet (Margin) | Counterparty | Partner Audit Node / Manual | 31,200 |
| | | Telecom Commission Calc Log | Internal | GCP Bucket | 31,200 |
| **UPI** | **NSDL PA UPI** | NPCI Settlement (Aggregator) | Counterparty | NPCI URCS Portal / Manual | 38,500 |
| | | Middleware File | Internal | GCP Bucket (Scheduled) | 38,500 |
| | | Switch File | Internal | SFTP / GCP Bucket | 38,500 |
| | | Wallet File | Internal | GCP Bucket (Scheduled) | 38,500 |
| **UPI** | **NSDL CASHPOINT** | Banking Settlement Report | Counterparty | Bank SFTP Node / Manual | 11,200 |
| | | Cashpoint Request Log | Internal | GCP Bucket | 11,200 |
| **DMT** | **Airtel DMT** | Bank Report File | Counterparty | Airtel Bank SFTP / Manual | 17,800 |
| | | Middleware Report File | Internal | GCP Bucket | 17,800 |
| | | Wallet Report File | Internal | GCP Bucket | 17,800 |
| **DMT** | **Fino DMT** | Bank Report File | Counterparty | Fino SFTP Portal / Manual | 13,900 |
| | | Middleware Report File | Internal | GCP Bucket | 13,900 |
| | | Wallet Report File | Internal | GCP Bucket | 13,900 |
| **DMT** | **NSDL DMT** | Bank Report File | Counterparty | NSDL SFTP Node / Manual | 15,400 |
| | | Middleware Report File | Internal | GCP Bucket | 15,400 |
| | | Wallet Report File | Internal | GCP Bucket | 15,400 |
| **POS** | **POS Recon** | Middleware - Transaction | Internal | GCP Bucket (Auto-Ingested) | 14,500 |
| | | Europa File - Switch | Internal | GCP Bucket (Auto-Ingested) | 14,500 |
| | | JV File - Network | Internal | GCP Bucket (Auto-Ingested) | 14,500 |
| **Payout** | **Wallet2Cashout** | RBL Nodal Bank Statement | Counterparty | RBL Bank SFTP / Manual | 16,800 |
| | | Payout Gateway Log | Internal | GCP Bucket | 16,800 |
| **Payout** | **W2Cashout IMPS** | Nodal Bank Clearing Report | Counterparty | RBL / Sponsor SFTP / Manual | 14,100 |
| | | W2Cashout IMPS Switch Log | Internal | GCP Bucket | 14,100 |
| **Payout** | **NSDL Cashout 4W** | NSDL Nodal Bank CBS Log | Counterparty | NSDL SFTP Node / Manual | 11,800 |
| | | NPCI Settlement File | Counterparty | NPCI Clearing Portal / Manual | 11,800 |
| | | NSDL Cashout Gateway Log | Internal | GCP Bucket | 11,800 |
| | | NSDL Switch Journal | Internal | GCP Bucket | 11,800 |
| **Payout** | **Axis Cashout** | Axis Nodal Bank Statement | Counterparty | Axis Direct SFTP / Manual | 13,200 |
| | | Axis Payout Engine Log | Internal | GCP Bucket | 13,200 |
| **Payout** | **IPPB Cashout** | IPPB Nodal Bank Clearing | Counterparty | IPPB SFTP Node / Manual | 9,900 |
| | | IPPB Cashout Switch Log | Internal | GCP Bucket | 9,900 |
| **Prepaid Card** | **TA Prepaid Card** | 86 NPCI File | Counterparty | GCP Bucket (Auto-Ingested) | 12,500 |
| | | Switch File | Internal | GCP Bucket (Auto-Ingested) | 12,500 |
| | | Middleware File | Internal | GCP Bucket (Auto-Ingested) | 12,500 |
| | | Wallet File | Internal | GCP Bucket (Auto-Ingested) | 12,500 |
| **Prepaid Card** | **TRANSCORP** | 86 NPCI File | Counterparty | GCP Bucket (Auto-Ingested) | 14,200 |
| | | Switch File | Internal | GCP Bucket (Auto-Ingested) | 14,200 |
| | | Middleware File | Internal | GCP Bucket (Auto-Ingested) | 14,200 |
| | | Wallet File | Internal | GCP Bucket (Auto-Ingested) | 14,200 |

---

## 4. Key Matching Criteria Columns & Schema Specifications

The platform reconciles disparate files by mapping system-specific column names into normalized matching primitives.

### System-Specific Key Column Schemas

| System | Primary Key | Amount Field | Status Field |
| :--- | :--- | :--- | :--- |
| **NPCI File (UPI)** | `Switch txn_id` | `Settlement amt / 100` | `Response code` |
| **NPCI File (BBPS/AEPS)** | `TxnRefID` | `SettlementAmount` | `ResponseCode` |
| **CBS File** | `TxnRefID` | `TxnAmount` | `Status` |
| **Switch File** | `client ref_id` | `Amount` | `Status` / `TxnStatus` |
| **Middleware Log** | `id` / `Txn ID` | `Amount` | `Status` |
| **Wallet Log** | `txn_id` | `Amount` | `Status` |
| **Nodal Bank Statement** | `UTR` / `Bank Ref ID` | `Credit/Debit Amount` | `Status` / `ClearanceStatus` |
| **Operator Sheet** | `Operator Ref ID` | `Recon Amount` | `Status` |

---

## 5. Way of Reconciliation (Reconciliation Engine Logic)

The reconciliation engine operates on three core principles: **Multi-Leg Cross Verification (N-Way)**, **Automated Exception Categorization**, and **Settlement Cycle Partitioning**.

### A. N-Way Reconciliation Methodologies

1. **2-Way Reconciliation**:
   - Compares **Internal Gateway Log** vs **External Counterparty (Bank/Operator)**.
   - Used in: *NSDL CASHPOINT*, *IPPB IMPS*, *Recharge Krack*, *Recharge Euro*, *Wallet2Cashout*, *Axis Cashout*, *IPPB Cashout*.

2. **3-Way Reconciliation**:
   - Cross-matches **Counterparty Settlement**, **Internal Switch Journal**, and **Middleware Application**.
   - Used in: *POS Recon*, *NSDL IMPS*, *Bharat Connect BOU*, *Bharat Connect COU*, *Airtel DMT*, *Fino DMT*, *NSDL DMT*.

3. **4-Way Reconciliation**:
   - Enterprise 4-leg cross-checking: **NPCI Settlement** $\longleftrightarrow$ **Switch Journal** $\longleftrightarrow$ **Middleware Application** $\longleftrightarrow$ **Wallet/Ledger**.
   - Used in: *NSDL PA UPI*, *Aadharpay*, *Fino AEPS*, *NSDL AEPS*, *IPPB AEPS*, *IPPB AEPS CD*, *IPPB Wallet*, *MATM 4-Way*, *NSDL Cashout 4-Way*, *TA Prepaid Card*, *TRANSCORP Prepaid Card*.

---

### B. Exception Resolution Matrix (Adjustment Criteria & Actionable Rules)

| NPCI Status | Switch Status | Middleware Status | Wallet Status | Discrepancy Reason | Prescribed Action (Way of Resolution) | URCS Workflow |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Success** | **Success** | **Success** | **Success** | *Fully Matched* | No Action (Auto-Settled) | None |
| **Success** | **Success** | **Inprogress** | N/A | *Middleware Processing Lag* | Raise credit adjustment to agent wallet | Internal Credit |
| **Success** | **Success** | **Inprogress** | **Success** | *Middleware State Inconsistency* | Update middleware record status to `SUCCESS` | DB Sync |
| **Success** | **Success** | **Success** | N/A | *Wallet Ledger Credit Pending* | Process wallet operation to `SUCCESS` | Wallet API |
| **Pending** | **Pending** | **Inprogress** | N/A | *Counterparty Clearing Timeout* | Raise RET (Reversal Entry) in URCS Portal | **URCS RET** |
| **Success** | **Failed** | **Failed** | N/A | *Switch Core Failure after Clearing* | Raise RET (Reversal Entry) in URCS Portal | **URCS RET** |
| **Pending** | **Success** | **Success** | **Success** | *NPCI Settlement File Omission* | Raise TCC (Transaction Charge/Claim) in URCS | **URCS TCC** |
| **Success** | **Pending** | **Success** | **Success** | *Switch Journal Sync Lag* | No Action (Allow standard EOD batch sync) | None |
| **Success** | **Success** | **Failed** | **Success** | *Amount Mismatch / Duplicate Debit* | Flag for Finance Audit & Manual Exception Review | Manual Audit |

---

### C. Settlement Cycle Windows

Reconciliation runs are partitioned into standardized cycle windows to match bank clearing and NPCI settlement cut-offs:

1. **Standard Products (8 Daily Cycles + Consolidated Batch)**:
   - Cycle 1: `00:00 - 03:00` Window
   - Cycle 2: `03:00 - 06:00` Window
   - Cycle 3: `06:00 - 09:00` Window
   - Cycle 4: `09:00 - 12:00` Window
   - Cycle 5: `12:00 - 15:00` Window
   - Cycle 6: `15:00 - 18:00` Window
   - Cycle 7: `18:00 - 21:00` Window
   - Cycle 8: `21:00 - 24:00` Window
   - **All Cycles**: `Daily Consolidated 24-Hour Batch`

2. **Bharat Connect / BBPS Products (10 Daily Cycles + Consolidated Batch)**:
   - Cycle 1: `00:00 - 02:15` Window
   - Cycle 2: `02:15 - 04:30` Window
   - Cycle 3: `04:30 - 06:45` Window
   - Cycle 4: `06:45 - 09:00` Window
   - Cycle 5: `09:00 - 11:15` Window
   - Cycle 6: `11:15 - 13:30` Window
   - Cycle 7: `13:30 - 15:45` Window
   - Cycle 8: `15:45 - 17:00` Window
   - Cycle 9: `17:00 - 19:00` Window
   - Cycle 10: `19:00 - 21:00` Window
   - **All Cycles**: `Daily Consolidated 24-Hour Batch`

---

## 6. Summary & Key Takeaways

1. **Total Product Coverage**: 26 sub-products across 4 business verticals (Agency Banking, Acquiring, Issuance, Bharat Connect).
2. **N-Way Scalability**: Clear partitioning into 2-Way, 3-Way, and 4-Way cross-reconciliation topologies.
3. **Automated Exception Handling**: Rule-driven URCS portal workflows for RET, TCC, and Credit Adjustments.
4. **Flexible Cycle Scheduling**: Granular 8-cycle and 10-cycle windowing aligned with NPCI settlement timelines.
