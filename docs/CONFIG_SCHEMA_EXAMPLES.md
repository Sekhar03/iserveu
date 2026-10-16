# Configuration Schema Examples
## File Formats, Match Rules, and TTUM Rules

**Version:** 1.0  
**Date:** 2026-10-15

---

## Table of Contents

1. [File Format Configuration](#1-file-format-configuration)
2. [Match Rule Configuration](#2-match-rule-configuration)
3. [TTUM Rule Configuration](#3-ttum-rule-configuration)
4. [GL Mapping Configuration](#4-gl-mapping-configuration)
5. [UPI Product Examples](#5-upi-product-examples)
6. [NFS Issuer Product Examples](#6-nfs-issuer-product-examples)

---

## 1. File Format Configuration

### 1.1 File Config Schema (JSON)

```json
{
  "product": "UPI",
  "source": "CBS",
  "file_name_pattern": "^CBS_UPI_(REMITTER|BENEFICIARY)_(\\d{8})_Cycle(\\d+)\\.csv$",
  "file_format": "CSV",
  "delimiter": ",",
  "header_rows": 1,
  "trailer_rows": 0,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {
      "source_column": "RetrievalRefNo",
      "data_type": "string",
      "required": true,
      "max_length": 50
    },
    "stan": {
      "source_column": "SystemTraceAuditNo",
      "data_type": "string",
      "required": false,
      "max_length": 20
    },
    "upi_txn_id": {
      "source_column": "UPITransactionId",
      "data_type": "string",
      "required": true,
      "max_length": 100
    },
    "txn_datetime": {
      "source_column": "TransactionDateTime",
      "data_type": "datetime",
      "required": true,
      "format": "dd-MM-yyyy HH:mm:ss"
    },
    "amount": {
      "source_column": "Amount",
      "data_type": "decimal",
      "required": true,
      "precision": 18,
      "scale": 2
    },
    "currency": {
      "source_column": "Currency",
      "data_type": "string",
      "required": false,
      "default": "INR",
      "max_length": 3
    },
    "fee_amount": {
      "source_column": "FeeAmount",
      "data_type": "decimal",
      "required": false,
      "precision": 18,
      "scale": 2,
      "default": 0.00
    },
    "status": {
      "source_column": "Status",
      "data_type": "string",
      "required": true,
      "max_length": 20
    },
    "response_code": {
      "source_column": "ResponseCode",
      "data_type": "string",
      "required": false,
      "max_length": 10
    },
    "account_no": {
      "source_column": "AccountNumber",
      "data_type": "string",
      "required": true,
      "encrypt": true,
      "max_length": 50
    },
    "branch_code": {
      "source_column": "BranchCode",
      "data_type": "string",
      "required": true,
      "max_length": 20
    },
    "channel": {
      "source_column": "Channel",
      "data_type": "string",
      "required": false,
      "max_length": 50
    },
    "dr_cr_flag": {
      "source_column": "DrCrFlag",
      "data_type": "string",
      "required": true,
      "enum": ["DR", "CR"]
    }
  },
  "date_format": "dd-MM-yyyy",
  "amount_format": "decimal(2)",
  "status_mapping": {
    "SUCCESS": "SUCCESS",
    "FAILED": "FAILED",
    "TIMEOUT": "TIMEOUT",
    "PENDING": "PENDING",
    "SUCCESS_DEEMED": "DEEMED",
    "REVERSED": "REVERSED"
  },
  "validation_rules": {
    "required_fields": ["rrn", "upi_txn_id", "txn_datetime", "amount", "status", "account_no", "branch_code"],
    "amount_range": {
      "min": 0.01,
      "max": 200000.00
    },
    "date_range": {
      "min_days_ago": 7,
      "max_days_future": 1
    }
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 1.2 Fixed-Width File Config Example (NFS Issuer CBS File)

```json
{
  "product": "NFS_ISSUER",
  "source": "CBS",
  "file_name_pattern": "^NFS_ISSUER_CBS_(\\d{8})\\.txt$",
  "file_format": "FIXED_WIDTH",
  "header_rows": 0,
  "trailer_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "record_type": {
      "position": 1,
      "length": 1,
      "data_type": "string",
      "required": true
    },
    "rrn": {
      "position": 2,
      "length": 12,
      "data_type": "string",
      "required": true
    },
    "stan": {
      "position": 14,
      "length": 6,
      "data_type": "string",
      "required": true
    },
    "card_no": {
      "position": 20,
      "length": 19,
      "data_type": "string",
      "required": true,
      "mask": true
    },
    "txn_date": {
      "position": 39,
      "length": 8,
      "data_type": "date",
      "required": true,
      "format": "yyyyMMdd"
    },
    "txn_time": {
      "position": 47,
      "length": 6,
      "data_type": "time",
      "required": true,
      "format": "HHmmss"
    },
    "amount": {
      "position": 53,
      "length": 12,
      "data_type": "decimal",
      "required": true,
      "precision": 2
    },
    "response_code": {
      "position": 65,
      "length": 3,
      "data_type": "string",
      "required": true
    },
    "auth_code": {
      "position": 68,
      "length": 6,
      "data_type": "string",
      "required": false
    },
    "terminal_id": {
      "position": 74,
      "length": 8,
      "data_type": "string",
      "required": true
    }
  },
  "trailer_validation": {
    "record_count_position": 1,
    "record_count_length": 10,
    "total_amount_position": 11,
    "total_amount_length": 15
  },
  "status_mapping": {
    "000": "SUCCESS",
    "001": "FAILED",
    "002": "TIMEOUT",
    "003": "REVERSED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 1.3 Excel File Config Example (BBPS CBS File)

```json
{
  "product": "BBPS",
  "source": "CBS",
  "file_name_pattern": "^BBPS_CBS_(\\d{8})\\.xlsx$",
  "file_format": "EXCEL",
  "sheet_name": "Transactions",
  "header_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {
      "source_column": "ReferenceNumber",
      "data_type": "string",
      "required": true
    },
    "txn_datetime": {
      "source_column": "TransactionDate",
      "data_type": "datetime",
      "required": true,
      "format": "yyyy-MM-dd"
    },
    "amount": {
      "source_column": "BillAmount",
      "data_type": "decimal",
      "required": true
    },
    "status": {
      "source_column": "PaymentStatus",
      "data_type": "string",
      "required": true
    },
    "account_no": {
      "source_column": "CustomerAccount",
      "data_type": "string",
      "required": true,
      "encrypt": true
    },
    "biller_id": {
      "source_column": "BillerID",
      "data_type": "string",
      "required": true
    }
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

---

## 2. Match Rule Configuration

### 2.1 Match Rule Schema (JSON)

```json
{
  "product": "UPI",
  "side": "REMITTER",
  "rule_name": "PRIMARY_MATCH_KEY",
  "rule_order": 1,
  "match_key_fields": [
    "upi_txn_id",
    "amount",
    "business_date"
  ],
  "amount_tolerance": 0.00,
  "time_window_minutes": 0,
  "fuzzy_match_enabled": false,
  "description": "Primary match key using UPI transaction ID, amount, and date",
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 2.2 Fallback Match Rule Example

```json
{
  "product": "UPI",
  "side": "REMITTER",
  "rule_name": "FALLBACK_MATCH_KEY",
  "rule_order": 2,
  "match_key_fields": [
    "rrn",
    "amount",
    "txn_datetime"
  ],
  "amount_tolerance": 0.00,
  "time_window_minutes": 5,
  "fuzzy_match_enabled": false,
  "description": "Fallback match key using RRN, amount, and transaction time with 5-minute window",
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 2.3 Fuzzy Match Rule Example

```json
{
  "product": "IMPS",
  "side": "REMITTER",
  "rule_name": "FUZZY_MATCH_KEY",
  "rule_order": 3,
  "match_key_fields": [
    "stan",
    "account_no",
    "amount"
  ],
  "amount_tolerance": 1.00,
  "time_window_minutes": 10,
  "fuzzy_match_enabled": true,
  "description": "Fuzzy match with ±₹1 amount tolerance and 10-minute time window",
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 2.4 NFS Issuer Match Rules (YAML)

```yaml
# NFS Issuer - Primary Match Key
- product: NFS_ISSUER
  side: ISSUER
  rule_name: PRIMARY_MATCH_KEY
  rule_order: 1
  match_key_fields:
    - rrn
    - stan
    - masked_card_no
    - amount
  amount_tolerance: 0.00
  time_window_minutes: 0
  fuzzy_match_enabled: false
  description: Primary match key using RRN, STAN, masked card, and amount
  is_active: true
  effective_from: '2026-01-01'

# NFS Issuer - Fallback Match Key
- product: NFS_ISSUER
  side: ISSUER
  rule_name: FALLBACK_MATCH_KEY
  rule_order: 2
  match_key_fields:
    - stan
    - masked_card_no
    - amount
    - txn_datetime
  amount_tolerance: 0.00
  time_window_minutes: 15
  fuzzy_match_enabled: false
  description: Fallback match key with 15-minute time window
  is_active: true
  effective_from: '2026-01-01'
```

---

## 3. TTUM Rule Configuration

### 3.1 TTUM Rule Schema (JSON)

```json
{
  "product": "UPI",
  "side": "REMITTER",
  "exception_type": "EX01",
  "description": "Debited in CBS, txn failed at network - Reverse debit",
  "dr_gl_account": "UPI_SETTLEMENT_GL",
  "cr_gl_account": "CUSTOMER_SUSPENSE_GL",
  "account_source": "TXN_ACCOUNT",
  "suspense_gl_account": "UNCLAIMED_GL",
  "value_date_offset_days": 0,
  "narration_template": "UPI REV RRN {rrn} DT {ddmmyyyy}",
  "amount_source": "TXN_AMOUNT",
  "conditions": {
    "check_account_status": true,
    "allow_suspense_if_frozen": true
  },
  "auto_generate": true,
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 3.2 UPI TTUM Rules (Complete Set)

```json
[
  {
    "product": "UPI",
    "side": "REMITTER",
    "exception_type": "EX01",
    "description": "Debited in CBS, txn failed at network - Reverse debit",
    "dr_gl_account": "UPI_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "TXN_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "UPI REV RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "REMITTER",
    "exception_type": "EX02",
    "description": "Debited in CBS, network missing/failed - Reverse debit",
    "dr_gl_account": "UPI_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "TXN_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "UPI REV RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "BENEFICIARY",
    "exception_type": "EX03",
    "description": "Network success, CBS not posted - Credit customer",
    "dr_gl_account": "UPI_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "NETWORK_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "UPI CR RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "BENEFICIARY",
    "exception_type": "EX04",
    "description": "Amount mismatch - Manual review required",
    "dr_gl_account": null,
    "cr_gl_account": null,
    "account_source": null,
    "suspense_gl_account": null,
    "value_date_offset_days": 0,
    "narration_template": null,
    "amount_source": null,
    "auto_generate": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "BENEFICIARY",
    "exception_type": "EX06",
    "description": "Network settled, bank failed - Credit customer",
    "dr_gl_account": "UPI_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "NETWORK_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "UPI CR RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

### 3.3 NFS Issuer TTUM Rules (YAML)

```yaml
# NFS Issuer - Failed Transaction Reversal
- product: NFS_ISSUER
  side: ISSUER
  exception_type: EX01
  description: Customer debited but transaction failed - Reverse credit
  dr_gl_account: NFS_SETTLEMENT_GL
  cr_gl_account: CUSTOMER_ACCOUNT
  account_source: TXN_ACCOUNT
  suspense_gl_account: UNCLAIMED_GL
  value_date_offset_days: 0
  narration_template: NFS REV RRN {rrn} DT {ddmmyyyy}
  amount_source: TXN_AMOUNT
  conditions:
    check_account_status: true
    allow_suspense_if_frozen: true
    calculate_compensation: true
  auto_generate: true
  is_active: true
  effective_from: '2026-01-01'

# NFS Issuer - No Cash Dispensed
- product: NFS_ISSUER
  side: ISSUER
  exception_type: EX06
  description: Network settled but no cash dispensed - Reverse credit
  dr_gl_account: NFS_SETTLEMENT_GL
  cr_gl_account: CUSTOMER_ACCOUNT
  account_source: TXN_ACCOUNT
  suspense_gl_account: UNCLAIMED_GL
  value_date_offset_days: 0
  narration_template: NFS NOCASH REV RRN {rrn} DT {ddmmyyyy}
  amount_source: TXN_AMOUNT
  conditions:
    check_account_status: true
    allow_suspense_if_frozen: true
    calculate_compensation: true
  auto_generate: true
  is_active: true
  effective_from: '2026-01-01'

# NFS Issuer - Compensation for Late Reversal
- product: NFS_ISSUER
  side: ISSUER
  exception_type: COMPENSATION
  description: RBI compensation for late reversal beyond TAT
  dr_gl_account: COMPENSATION_GL
  cr_gl_account: CUSTOMER_ACCOUNT
  account_source: TXN_ACCOUNT
  suspense_gl_account: UNCLAIMED_GL
  value_date_offset_days: 0
  narration_template: NFS COMP RRN {rrn} DT {ddmmyyyy}
  amount_source: CALCULATED
  conditions:
    compensation_per_day: 100.00
    max_compensation: 5000.00
  auto_generate: true
  is_active: true
  effective_from: '2026-01-01'
```

---

## 4. GL Mapping Configuration

### 4.1 GL Mapping Schema (JSON)

```json
{
  "product": "UPI",
  "gl_code": "UPI_SETTLEMENT_GL",
  "gl_name": "UPI Settlement Account",
  "gl_type": "SETTLEMENT",
  "account_no": "1001001001",
  "branch_code": "HO001",
  "currency": "INR",
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 4.2 Complete GL Mapping for UPI (JSON)

```json
[
  {
    "product": "UPI",
    "gl_code": "UPI_SETTLEMENT_GL",
    "gl_name": "UPI Settlement Account",
    "gl_type": "SETTLEMENT",
    "account_no": "1001001001",
    "branch_code": "HO001",
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "gl_code": "UPI_SUSPENSE_GL",
    "gl_name": "UPI Suspense Account",
    "gl_type": "SUSPENSE",
    "account_no": "1001001002",
    "branch_code": "HO001",
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "gl_code": "UPI_CHARGEBACK_GL",
    "gl_name": "UPI Chargeback Account",
    "gl_type": "CHARGEBACK",
    "account_no": "1001001003",
    "branch_code": "HO001",
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "gl_code": "UNCLAIMED_GL",
    "gl_name": "Unclaimed Account",
    "gl_type": "SUSPENSE",
    "account_no": "1001001999",
    "branch_code": "HO001",
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

### 4.3 GL Mapping for NFS Issuer (YAML)

```yaml
# NFS Issuer GL Accounts
- product: NFS_ISSUER
  gl_code: NFS_SETTLEMENT_GL
  gl_name: NFS Settlement Account
  gl_type: SETTLEMENT
  account_no: "1002001001"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'

- product: NFS_ISSUER
  gl_code: NFS_SUSPENSE_GL
  gl_name: NFS Suspense Account
  gl_type: SUSPENSE
  account_no: "1002001002"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'

- product: NFS_ISSUER
  gl_code: NFS_CHARGEBACK_GL
  gl_name: NFS Chargeback Account
  gl_type: CHARGEBACK
  account_no: "1002001003"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'

- product: NFS_ISSUER
  gl_code: NFS_COMPENSATION_GL
  gl_name: NFS Compensation Account
  gl_type: COMPENSATION
  account_no: "1002001004"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'

- product: NFS_ISSUER
  gl_code: ATM_CASH_GL
  gl_name: ATM Cash Account
  gl_type: ATM_CASH
  account_no: "1002002001"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'

- product: NFS_ISSUER
  gl_code: UNCLAIMED_GL
  gl_name: Unclaimed Account
  gl_type: SUSPENSE
  account_no: "1001001999"
  branch_code: HO001
  is_active: true
  effective_from: '2026-01-01'
```

---

## 5. UPI Product Examples

### 5.1 UPI CBS File Config (Remitter)

```json
{
  "product": "UPI",
  "source": "CBS",
  "side": "REMITTER",
  "file_name_pattern": "^CBS_UPI_REMITTER_(\\d{8})_Cycle(\\d+)\\.csv$",
  "file_format": "CSV",
  "delimiter": ",",
  "header_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {"source_column": "RRN", "data_type": "string", "required": true},
    "upi_txn_id": {"source_column": "UPITxnId", "data_type": "string", "required": true},
    "txn_datetime": {"source_column": "TxnDateTime", "data_type": "datetime", "required": true, "format": "dd-MM-yyyy HH:mm:ss"},
    "amount": {"source_column": "Amount", "data_type": "decimal", "required": true},
    "status": {"source_column": "Status", "data_type": "string", "required": true},
    "response_code": {"source_column": "RespCode", "data_type": "string", "required": false},
    "account_no": {"source_column": "AccountNo", "data_type": "string", "required": true, "encrypt": true},
    "branch_code": {"source_column": "BranchCode", "data_type": "string", "required": true},
    "dr_cr_flag": {"source_column": "DrCr", "data_type": "string", "required": true, "enum": ["DR", "CR"]}
  },
  "status_mapping": {
    "SUCCESS": "SUCCESS",
    "FAILED": "FAILED",
    "TIMEOUT": "TIMEOUT",
    "SUCCESS_DEEMED": "DEEMED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 5.2 UPI Switch File Config

```json
{
  "product": "UPI",
  "source": "SWITCH",
  "file_name_pattern": "^UPI_SWITCH_(\\d{8})_Cycle(\\d+)\\.csv$",
  "file_format": "CSV",
  "delimiter": "|",
  "header_rows": 0,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {"position": 1, "data_type": "string", "required": true},
    "upi_txn_id": {"position": 2, "data_type": "string", "required": true},
    "stan": {"position": 3, "data_type": "string", "required": false},
    "txn_datetime": {"position": 4, "data_type": "datetime", "required": true, "format": "yyyyMMddHHmmss"},
    "amount": {"position": 5, "data_type": "decimal", "required": true},
    "status": {"position": 6, "data_type": "string", "required": true},
    "response_code": {"position": 7, "data_type": "string", "required": false},
    "merchant_id": {"position": 8, "data_type": "string", "required": false}
  },
  "status_mapping": {
    "00": "SUCCESS",
    "99": "FAILED",
    "98": "TIMEOUT",
    "97": "DEEMED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 5.3 UPI NPCI File Config

```json
{
  "product": "UPI",
  "source": "NETWORK",
  "file_name_pattern": "^NPCI_UPI_(\\d{8})_Cycle(\\d+)\\.csv$",
  "file_format": "CSV",
  "delimiter": ",",
  "header_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "upi_txn_id": {"source_column": "UPI_Transaction_ID", "data_type": "string", "required": true},
    "rrn": {"source_column": "RRN", "data_type": "string", "required": true},
    "txn_datetime": {"source_column": "Transaction_Date_Time", "data_type": "datetime", "required": true, "format": "yyyy-MM-dd HH:mm:ss"},
    "amount": {"source_column": "Settlement_Amount", "data_type": "decimal", "required": true, "divide_by": 100},
    "status": {"source_column": "Response_Code", "data_type": "string", "required": true},
    "response_code": {"source_column": "Response_Code", "data_type": "string", "required": true},
    "payer_vpa": {"source_column": "Payer_VPA", "data_type": "string", "required": false},
    "payee_vpa": {"source_column": "Payee_VPA", "data_type": "string", "required": false}
  },
  "status_mapping": {
    "00": "SUCCESS",
    "U99": "FAILED",
    "U98": "TIMEOUT",
    "U97": "DEEMED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 5.4 UPI Match Rules (Complete)

```json
[
  {
    "product": "UPI",
    "side": "REMITTER",
    "rule_name": "PRIMARY_MATCH_KEY",
    "rule_order": 1,
    "match_key_fields": ["upi_txn_id", "amount", "business_date"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 0,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "REMITTER",
    "rule_name": "FALLBACK_MATCH_KEY",
    "rule_order": 2,
    "match_key_fields": ["rrn", "amount", "txn_datetime"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 5,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "BENEFICIARY",
    "rule_name": "PRIMARY_MATCH_KEY",
    "rule_order": 1,
    "match_key_fields": ["upi_txn_id", "amount", "business_date"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 0,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "side": "BENEFICIARY",
    "rule_name": "FALLBACK_MATCH_KEY",
    "rule_order": 2,
    "match_key_fields": ["rrn", "amount", "txn_datetime"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 5,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

---

## 6. NFS Issuer Product Examples

### 6.1 NFS Issuer CBS File Config

```json
{
  "product": "NFS_ISSUER",
  "source": "CBS",
  "file_name_pattern": "^NFS_ISSUER_CBS_(\\d{8})\\.txt$",
  "file_format": "FIXED_WIDTH",
  "header_rows": 0,
  "trailer_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "record_type": {"position": 1, "length": 1, "data_type": "string", "required": true},
    "rrn": {"position": 2, "length": 12, "data_type": "string", "required": true},
    "stan": {"position": 14, "length": 6, "data_type": "string", "required": true},
    "card_no": {"position": 20, "length": 19, "data_type": "string", "required": true, "mask": true},
    "txn_date": {"position": 39, "length": 8, "data_type": "date", "required": true, "format": "yyyyMMdd"},
    "txn_time": {"position": 47, "length": 6, "data_type": "time", "required": true, "format": "HHmmss"},
    "amount": {"position": 53, "length": 12, "data_type": "decimal", "required": true, "precision": 2},
    "response_code": {"position": 65, "length": 3, "data_type": "string", "required": true},
    "auth_code": {"position": 68, "length": 6, "data_type": "string", "required": false},
    "terminal_id": {"position": 74, "length": 8, "data_type": "string", "required": true},
    "account_no": {"position": 82, "length": 16, "data_type": "string", "required": true, "encrypt": true}
  },
  "trailer_validation": {
    "record_count_position": 1,
    "record_count_length": 10,
    "total_amount_position": 11,
    "total_amount_length": 15
  },
  "status_mapping": {
    "000": "SUCCESS",
    "001": "FAILED",
    "002": "TIMEOUT",
    "003": "REVERSED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 6.2 NFS Issuer Switch File Config

```json
{
  "product": "NFS_ISSUER",
  "source": "SWITCH",
  "file_name_pattern": "^NFS_SWITCH_(\\d{8})\\.csv$",
  "file_format": "CSV",
  "delimiter": ",",
  "header_rows": 1,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {"source_column": "RRN", "data_type": "string", "required": true},
    "stan": {"source_column": "STAN", "data_type": "string", "required": true},
    "card_no": {"source_column": "CardNumber", "data_type": "string", "required": true, "mask": true},
    "txn_datetime": {"source_column": "TxnDateTime", "data_type": "datetime", "required": true, "format": "dd-MM-yyyy HH:mm:ss"},
    "amount": {"source_column": "Amount", "data_type": "decimal", "required": true},
    "status": {"source_column": "Status", "data_type": "string", "required": true},
    "response_code": {"source_column": "RespCode", "data_type": "string", "required": true},
    "auth_code": {"source_column": "AuthCode", "data_type": "string", "required": false},
    "terminal_id": {"source_column": "TerminalID", "data_type": "string", "required": true}
  },
  "status_mapping": {
    "SUCCESS": "SUCCESS",
    "FAILED": "FAILED",
    "TIMEOUT": "TIMEOUT",
    "REVERSED": "REVERSED"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 6.3 NFS Issuer NPCI File Config

```json
{
  "product": "NFS_ISSUER",
  "source": "NETWORK",
  "file_name_pattern": "^NFS_NPCI_(\\d{8})\\.csv$",
  "file_format": "CSV",
  "delimiter": "|",
  "header_rows": 0,
  "encoding": "UTF-8",
  "column_mapping": {
    "rrn": {"position": 1, "data_type": "string", "required": true},
    "stan": {"position": 2, "data_type": "string", "required": true},
    "card_no": {"position": 3, "data_type": "string", "required": true, "mask": true},
    "txn_date": {"position": 4, "data_type": "date", "required": true, "format": "yyyyMMdd"},
    "txn_time": {"position": 5, "data_type": "time", "required": true, "format": "HHmmss"},
    "amount": {"position": 6, "data_type": "decimal", "required": true},
    "response_code": {"position": 7, "data_type": "string", "required": true},
    "auth_code": {"position": 8, "data_type": "string", "required": false},
    "terminal_id": {"position": 9, "data_type": "string", "required": true}
  },
  "status_mapping": {
    "000": "SUCCESS",
    "001": "FAILED",
    "002": "TIMEOUT"
  },
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 6.4 NFS Issuer Match Rules (Complete)

```json
[
  {
    "product": "NFS_ISSUER",
    "side": "ISSUER",
    "rule_name": "PRIMARY_MATCH_KEY",
    "rule_order": 1,
    "match_key_fields": ["rrn", "stan", "masked_card_no", "amount"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 0,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "NFS_ISSUER",
    "side": "ISSUER",
    "rule_name": "FALLBACK_MATCH_KEY",
    "rule_order": 2,
    "match_key_fields": ["stan", "masked_card_no", "amount", "txn_datetime"],
    "amount_tolerance": 0.00,
    "time_window_minutes": 15,
    "fuzzy_match_enabled": false,
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

### 6.5 NFS Issuer TTUM Rules (Complete)

```json
[
  {
    "product": "NFS_ISSUER",
    "side": "ISSUER",
    "exception_type": "EX01",
    "description": "Customer debited but transaction failed - Reverse credit",
    "dr_gl_account": "NFS_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "TXN_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "NFS REV RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "conditions": {
      "check_account_status": true,
      "allow_suspense_if_frozen": true,
      "calculate_compensation": true
    },
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "NFS_ISSUER",
    "side": "ISSUER",
    "exception_type": "EX06",
    "description": "Network settled but no cash dispensed - Reverse credit",
    "dr_gl_account": "NFS_SETTLEMENT_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "TXN_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "NFS NOCASH REV RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "TXN_AMOUNT",
    "conditions": {
      "check_account_status": true,
      "allow_suspense_if_frozen": true,
      "calculate_compensation": true
    },
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "NFS_ISSUER",
    "side": "ISSUER",
    "exception_type": "COMPENSATION",
    "description": "RBI compensation for late reversal beyond TAT",
    "dr_gl_account": "NFS_COMPENSATION_GL",
    "cr_gl_account": "CUSTOMER_ACCOUNT",
    "account_source": "TXN_ACCOUNT",
    "suspense_gl_account": "UNCLAIMED_GL",
    "value_date_offset_days": 0,
    "narration_template": "NFS COMP RRN {rrn} DT {ddmmyyyy}",
    "amount_source": "CALCULATED",
    "conditions": {
      "compensation_per_day": 100.00,
      "max_compensation": 5000.00,
      "tat_hours": 24
    },
    "auto_generate": true,
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

---

## 7. Expected File Calendar Configuration

### 7.1 Expected File Calendar Schema (JSON)

```json
{
  "product": "UPI",
  "source": "CBS",
  "cycle_no": 1,
  "expected_file_pattern": "^CBS_UPI_(REMITTER|BENEFICIARY)_(\\d{8})_Cycle1\\.csv$",
  "expected_by_time": "03:30:00",
  "alert_if_missing": true,
  "alert_after_minutes": 30,
  "active_days": [1, 2, 3, 4, 5, 6, 7],
  "is_active": true,
  "effective_from": "2026-01-01"
}
```

### 7.2 UPI Expected File Calendar (Complete)

```json
[
  {
    "product": "UPI",
    "source": "CBS",
    "cycle_no": 1,
    "expected_file_pattern": "^CBS_UPI_(REMITTER|BENEFICIARY)_(\\d{8})_Cycle1\\.csv$",
    "expected_by_time": "03:30:00",
    "alert_if_missing": true,
    "alert_after_minutes": 30,
    "active_days": [1, 2, 3, 4, 5, 6, 7],
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "source": "CBS",
    "cycle_no": 2,
    "expected_file_pattern": "^CBS_UPI_(REMITTER|BENEFICIARY)_(\\d{8})_Cycle2\\.csv$",
    "expected_by_time": "06:30:00",
    "alert_if_missing": true,
    "alert_after_minutes": 30,
    "active_days": [1, 2, 3, 4, 5, 6, 7],
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "source": "SWITCH",
    "cycle_no": 1,
    "expected_file_pattern": "^UPI_SWITCH_(\\d{8})_Cycle1\\.csv$",
    "expected_by_time": "03:30:00",
    "alert_if_missing": true,
    "alert_after_minutes": 30,
    "active_days": [1, 2, 3, 4, 5, 6, 7],
    "is_active": true,
    "effective_from": "2026-01-01"
  },
  {
    "product": "UPI",
    "source": "NETWORK",
    "cycle_no": 1,
    "expected_file_pattern": "^NPCI_UPI_(\\d{8})_Cycle1\\.csv$",
    "expected_by_time": "04:00:00",
    "alert_if_missing": true,
    "alert_after_minutes": 60,
    "active_days": [1, 2, 3, 4, 5, 6, 7],
    "is_active": true,
    "effective_from": "2026-01-01"
  }
]
```

---

## 8. Configuration Management Notes

### 8.1 Versioning

- All configuration tables support versioning via `effective_from` and `effective_to` dates
- New configurations are added with current date as `effective_from`
- Old configurations are updated with the day before new config's `effective_from` as `effective_to`
- System always queries configuration based on current business date

### 8.2 Validation

- Configuration changes must pass validation before save:
  - GL accounts must exist in GL mapping
  - Match key fields must exist in column mapping
  - Status mappings must be valid enum values
  - Amount tolerances must be non-negative
  - Time windows must be reasonable (0-1440 minutes)

### 8.3 Deployment

- Configuration changes are deployed via:
  - Admin UI (for ad-hoc changes)
  - SQL scripts (for bulk changes)
  - API endpoints (for automated deployments)
- All configuration changes are audited in `audit_log`
- Configuration rollback is supported by setting `effective_to` on current version

### 8.4 Testing

- Test configurations should be created in a separate environment
- Configuration changes should be tested with sample files before production deployment
- Configuration validation scripts should be run before deployment

---

**End of Configuration Schema Examples**
