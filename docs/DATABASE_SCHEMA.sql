-- ============================================================================
-- Saraswat Co-operative Bank Ltd. - Digital Payments Reconciliation Platform
-- Database Schema (DDL)
-- ============================================================================
-- Database: PostgreSQL 15+
-- Author: Devin
-- Date: 2026-10-15
-- Version: 1.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_partman";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE product_type AS ENUM (
    'UPI', 'IMPS', 'AEPS', 'BBPS', 'NETC', 'PAYMENT_GATEWAY',
    'RUPAY', 'VISA', 'NFS_ISSUER', 'NFS_ACQUIRER', 'GIFT_CARD'
);

CREATE TYPE transaction_side AS ENUM (
    'REMITTER', 'BENEFICIARY', 'ISSUER', 'ACQUIRER'
);

CREATE TYPE source_type AS ENUM (
    'CBS', 'SWITCH', 'NETWORK', 'MIDDLEWARE', 'WALLET', 'NODAL_BANK',
    'OPERATOR', 'SETTLEMENT'
);

CREATE TYPE file_status AS ENUM (
    'RECEIVED', 'VALIDATED', 'PARTIAL', 'FAILED', 'PROCESSED', 'ARCHIVED'
);

CREATE TYPE txn_status AS ENUM (
    'SUCCESS', 'FAILED', 'TIMEOUT', 'REVERSED', 'DEEMED', 'PENDING'
);

CREATE TYPE recon_status AS ENUM (
    'MATCHED', 'UNMATCHED', 'PARTIAL_MATCH', 'PENDING', 'EXCEPTION'
);

CREATE TYPE exception_type AS ENUM (
    'EX01', 'EX02', 'EX03', 'EX04', 'EX05', 'EX06', 'EX07', 'EX08', 'EX09'
);

CREATE TYPE exception_owner AS ENUM (
    'L1', 'L2', 'L3', 'FINANCE', 'IT'
);

CREATE TYPE exception_workflow_status AS ENUM (
    'OPEN', 'TTUM_GENERATED', 'POSTED', 'DISPUTE', 'CLOSED', 'ESCALATED'
);

CREATE TYPE ttum_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'APPROVED', 'GENERATED', 'UPLOADED', 'POSTED', 'FAILED'
);

CREATE TYPE dr_cr_flag AS ENUM (
    'DR', 'CR'
);

CREATE TYPE dispute_status AS ENUM (
    'RAISED', 'VALIDATED', 'FILED', 'ACCEPTED', 'REJECTED', 'PRE_ARBITRATION',
    'ARBITRATION', 'CLOSED', 'WITHDRAWN'
);

CREATE TYPE dispute_type AS ENUM (
    'CHARGEBACK', 'PRE_ARBITRATION', 'ODR', 'REFUND', 'OTHER'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_APPROVAL'
);

CREATE TYPE audit_action AS ENUM (
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'OVERRIDE'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- File Configuration
-- ----------------------------------------------------------------------------

CREATE TABLE file_config (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    source source_type NOT NULL,
    file_name_pattern VARCHAR(255) NOT NULL,
    file_format VARCHAR(20) NOT NULL, -- CSV, FIXED_WIDTH, XML, JSON, EXCEL
    delimiter VARCHAR(5), -- For CSV: comma, pipe, tab
    header_rows INTEGER DEFAULT 1,
    trailer_rows INTEGER DEFAULT 0,
    encoding VARCHAR(20) DEFAULT 'UTF-8',
    column_mapping JSONB NOT NULL, -- Field mapping to common schema
    date_format VARCHAR(50), -- e.g., 'ddMMyyyy', 'yyyy-MM-dd'
    amount_format VARCHAR(50), -- e.g., 'decimal(2)', 'cents'
    status_mapping JSONB, -- Source status to standard status mapping
    validation_rules JSONB, -- Validation rules (required fields, ranges, etc.)
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE(product, source, effective_from)
);

CREATE INDEX idx_file_config_product ON file_config(product);
CREATE INDEX idx_file_config_source ON file_config(source);

-- ----------------------------------------------------------------------------
-- File Register
-- ----------------------------------------------------------------------------

CREATE TABLE file_register (
    id BIGSERIAL PRIMARY KEY,
    file_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    source source_type NOT NULL,
    business_date DATE NOT NULL,
    cycle_no INTEGER,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_size BIGINT,
    file_checksum VARCHAR(64) NOT NULL, -- SHA-256
    record_count INTEGER,
    header_record TEXT,
    trailer_record TEXT,
    file_status file_status DEFAULT 'RECEIVED',
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    archived_at TIMESTAMP,
    archive_path VARCHAR(1024),
    validation_errors TEXT,
    processing_errors TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partition by business_date (range) and product (list)
-- Note: Use pg_partman for automatic partition management
CREATE INDEX idx_file_register_product_date ON file_register(product, business_date);
CREATE INDEX idx_file_register_status ON file_register(file_status);
CREATE INDEX idx_file_register_checksum ON file_register(file_checksum, file_name, business_date);

-- ----------------------------------------------------------------------------
-- Raw Records (Staging Tables - one per source type)
-- ----------------------------------------------------------------------------

-- Generic raw records table (can be partitioned by product and date)
CREATE TABLE raw_records (
    id BIGSERIAL,
    file_id UUID NOT NULL REFERENCES file_register(file_id),
    row_no INTEGER NOT NULL,
    raw_data TEXT NOT NULL, -- Original row as text
    parsed_data JSONB, -- Parsed JSON representation
    source source_type NOT NULL,
    product product_type NOT NULL,
    business_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, business_date)
);

-- Partitioning strategy: Partition by business_date (range) and product (list)
-- Example partition creation (manual for reference):
-- CREATE TABLE raw_records_20261015 PARTITION OF raw_records
--     FOR VALUES FROM ('2026-10-15') TO ('2026-10-16');

CREATE INDEX idx_raw_records_file_id ON raw_records(file_id);
CREATE INDEX idx_raw_records_product_date ON raw_records(product, business_date);

-- ----------------------------------------------------------------------------
-- Reject Records
-- ----------------------------------------------------------------------------

CREATE TABLE reject_records (
    id BIGSERIAL PRIMARY KEY,
    file_id UUID NOT NULL REFERENCES file_register(file_id),
    row_no INTEGER NOT NULL,
    raw_data TEXT NOT NULL,
    reject_reason VARCHAR(500) NOT NULL,
    reject_code VARCHAR(50),
    source source_type NOT NULL,
    product product_type NOT NULL,
    business_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reject_records_file_id ON reject_records(file_id);
CREATE INDEX idx_reject_records_product_date ON reject_records(product, business_date);

-- ----------------------------------------------------------------------------
-- Normalised Transaction Schema (Core Table)
-- ----------------------------------------------------------------------------

CREATE TABLE txn_normalised (
    id BIGSERIAL,
    txn_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    source source_type NOT NULL,
    file_id UUID NOT NULL REFERENCES file_register(file_id),
    row_no INTEGER NOT NULL,
    business_date DATE NOT NULL,
    settlement_date DATE,
    cycle_no INTEGER,
    
    -- Key identifiers
    rrn VARCHAR(50),
    stan VARCHAR(20),
    upi_txn_id VARCHAR(100),
    network_ref VARCHAR(100),
    auth_code VARCHAR(20),
    
    -- Transaction details
    txn_datetime TIMESTAMP,
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    fee_amount DECIMAL(18,2),
    
    -- Status
    status txn_status NOT NULL,
    response_code VARCHAR(10),
    
    -- Account and entity details
    account_no VARCHAR(50), -- Encrypted
    masked_account_no VARCHAR(20), -- Last 4 digits
    masked_card_no VARCHAR(20), -- First 6 + last 4
    branch_code VARCHAR(20),
    channel VARCHAR(50),
    merchant_id VARCHAR(50),
    terminal_id VARCHAR(50),
    
    -- Reconciliation
    dr_cr_flag dr_cr_flag,
    original_txn_ref VARCHAR(100), -- For reversals
    match_key VARCHAR(255), -- Computed match key
    recon_status recon_status DEFAULT 'PENDING',
    exception_type exception_type,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, business_date),
    UNIQUE (file_id, row_no)
);

-- Partition by business_date (range) and product (list)
CREATE INDEX idx_txn_normalised_txn_id ON txn_normalised(txn_id);
CREATE INDEX idx_txn_normalised_match_key ON txn_normalised(match_key);
CREATE INDEX idx_txn_normalised_rrn ON txn_normalised(rrn);
CREATE INDEX idx_txn_normalised_product_date ON txn_normalised(product, business_date);
CREATE INDEX idx_txn_normalised_recon_status ON txn_normalised(recon_status);
CREATE INDEX idx_txn_normalised_file_id ON txn_normalised(file_id);

-- ----------------------------------------------------------------------------
-- Match Rule Configuration
-- ----------------------------------------------------------------------------

CREATE TABLE match_rule_config (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_order INTEGER NOT NULL, -- Hierarchy: 1=primary, 2=fallback, 3=fuzzy
    match_key_fields JSONB NOT NULL, -- e.g., ["rrn", "amount", "business_date"]
    amount_tolerance DECIMAL(10,2) DEFAULT 0.00,
    time_window_minutes INTEGER DEFAULT 0,
    fuzzy_match_enabled BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE(product, side, rule_name, effective_from)
);

CREATE INDEX idx_match_rule_config_product ON match_rule_config(product, side);

-- ----------------------------------------------------------------------------
-- Reconciliation Result
-- ----------------------------------------------------------------------------

CREATE TABLE recon_result (
    id BIGSERIAL PRIMARY KEY,
    recon_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    business_date DATE NOT NULL,
    cycle_no INTEGER,
    
    -- Matched transaction IDs
    cbs_txn_id UUID REFERENCES txn_normalised(txn_id),
    switch_txn_id UUID REFERENCES txn_normalised(txn_id),
    network_txn_id UUID REFERENCES txn_normalised(txn_id),
    wallet_txn_id UUID REFERENCES txn_normalised(txn_id),
    
    -- Match status
    recon_status recon_status NOT NULL,
    match_confidence DECIMAL(5,2), -- 0-100 for fuzzy matches
    
    -- Exception details
    exception_type exception_type,
    exception_description TEXT,
    
    -- Amounts for comparison
    cbs_amount DECIMAL(18,2),
    switch_amount DECIMAL(18,2),
    network_amount DECIMAL(18,2),
    wallet_amount DECIMAL(18,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recon_result_product_date ON recon_result(product, business_date);
CREATE INDEX idx_recon_result_status ON recon_result(recon_status);
CREATE INDEX idx_recon_result_exception ON recon_result(exception_type);

-- ----------------------------------------------------------------------------
-- Reconciliation Summary
-- ----------------------------------------------------------------------------

CREATE TABLE recon_summary (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    business_date DATE NOT NULL,
    cycle_no INTEGER,
    
    -- Counts
    total_cbs_records INTEGER DEFAULT 0,
    total_switch_records INTEGER DEFAULT 0,
    total_network_records INTEGER DEFAULT 0,
    total_wallet_records INTEGER DEFAULT 0,
    
    matched_count INTEGER DEFAULT 0,
    unmatched_count INTEGER DEFAULT 0,
    partial_match_count INTEGER DEFAULT 0,
    
    -- Amounts
    matched_amount DECIMAL(18,2) DEFAULT 0.00,
    unmatched_amount DECIMAL(18,2) DEFAULT 0.00,
    
    -- Exception breakdown
    exception_counts JSONB, -- {"EX01": 100, "EX02": 50, ...}
    exception_amounts JSONB, -- {"EX01": 100000.00, "EX02": 50000.00, ...}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product, side, business_date, cycle_no)
);

CREATE INDEX idx_recon_summary_product_date ON recon_summary(product, business_date);

-- ----------------------------------------------------------------------------
-- Exception Master
-- ----------------------------------------------------------------------------

CREATE TABLE exception_master (
    code exception_type PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    cbs_status txn_status,
    switch_status txn_status,
    network_status txn_status,
    wallet_status txn_status,
    meaning VARCHAR(500),
    default_action VARCHAR(100), -- TTUM_GENERATE, MANUAL_REVIEW, DISPUTE, etc.
    tat_hours INTEGER, -- TAT for resolution
    owner exception_owner DEFAULT 'L1',
    is_active BOOLEAN DEFAULT true
);

-- Seed exception master data
INSERT INTO exception_master (code, description, cbs_status, switch_status, network_status, meaning, default_action, tat_hours, owner) VALUES
('EX01', 'Debited in CBS, txn failed at network', 'SUCCESS', 'FAILED', 'FAILED', 'Customer debited but transaction failed', 'TTUM_GENERATE', 24, 'L1'),
('EX02', 'Debited in CBS, network missing/failed', 'SUCCESS', 'SUCCESS', NULL, 'Customer debited but network has no success', 'TTUM_GENERATE', 24, 'L1'),
('EX03', 'Network success, CBS not posted', NULL, 'SUCCESS', 'SUCCESS', 'Network settled but CBS not posted', 'TTUM_GENERATE', 24, 'L1'),
('EX04', 'Amount mismatch', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'Amount differs between sources', 'MANUAL_REVIEW', 48, 'L2'),
('EX05', 'Duplicate posting', 'SUCCESS', NULL, NULL, 'Duplicate posting in CBS', 'MANUAL_REVIEW', 48, 'L2'),
('EX06', 'Network settled, bank failed', NULL, 'FAILED', 'SUCCESS', 'Network settled but bank failed', 'TTUM_GENERATE', 24, 'L1'),
('EX07', 'Switch record missing', 'SUCCESS', NULL, 'SUCCESS', 'Switch record missing', 'MANUAL_REVIEW', 48, 'L2'),
('EX08', 'Status mismatch (timeout/deemed)', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'Status mismatch (timeout/deemed)', 'MANUAL_REVIEW', 48, 'L2'),
('EX09', 'Wrong reversal', 'REVERSED', 'SUCCESS', 'SUCCESS', 'Wrong reversal in CBS', 'MANUAL_REVIEW', 48, 'L2');

-- ----------------------------------------------------------------------------
-- Exception History
-- ----------------------------------------------------------------------------

CREATE TABLE exception_history (
    id BIGSERIAL PRIMARY KEY,
    exception_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    business_date DATE NOT NULL,
    
    -- Reference
    rrn VARCHAR(50),
    txn_id UUID REFERENCES txn_normalised(txn_id),
    recon_id UUID REFERENCES recon_result(recon_id),
    
    -- Exception details
    exception_type exception_type NOT NULL,
    exception_description TEXT,
    
    -- Amounts
    amount DECIMAL(18,2),
    
    -- Workflow
    status exception_workflow_status DEFAULT 'OPEN',
    owner exception_owner DEFAULT 'L1',
    assigned_to VARCHAR(100),
    
    -- Ageing
    raised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tat_deadline TIMESTAMP,
    age_days INTEGER GENERATED ALWAYS AS (DATE_PART('day', CURRENT_TIMESTAMP - raised_at)) STORED,
    
    -- Resolution
    resolution_action VARCHAR(100),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    
    -- TTUM linkage
    ttum_batch_id BIGINT,
    
    -- Dispute linkage
    dispute_id BIGINT,
    
    -- Comments
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exception_history_product_date ON exception_history(product, business_date);
CREATE INDEX idx_exception_history_status ON exception_history(status);
CREATE INDEX idx_exception_history_type ON exception_history(exception_type);
CREATE INDEX idx_exception_history_rrn ON exception_history(rrn);
CREATE INDEX idx_exception_history_owner ON exception_history(owner);
CREATE INDEX idx_exception_history_tat ON exception_history(tat_deadline) WHERE status = 'OPEN';

-- ----------------------------------------------------------------------------
-- TTUM Rule Configuration
-- ----------------------------------------------------------------------------

CREATE TABLE ttum_rule_config (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    side transaction_side NOT NULL,
    exception_type exception_type NOT NULL,
    
    -- GL mapping
    dr_gl_account VARCHAR(50) NOT NULL,
    cr_gl_account VARCHAR(50) NOT NULL,
    
    -- Account handling
    account_source VARCHAR(50), -- CBS, WALLET, SUSPENSE
    suspense_gl_account VARCHAR(50), -- For frozen/closed accounts
    
    -- Value date
    value_date_offset_days INTEGER DEFAULT 0,
    
    -- Narration
    narration_template VARCHAR(255) DEFAULT '{PRODUCT} {REV/CR/ADJ} RRN {rrn} DT {ddmmyyyy}',
    
    -- Amount calculation
    amount_source VARCHAR(50) DEFAULT 'TXN_AMOUNT', -- TXN_AMOUNT, FEE_AMOUNT, TOTAL
    
    -- Conditions
    conditions JSONB, -- Additional conditions for rule application
    
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    UNIQUE(product, side, exception_type, effective_from)
);

CREATE INDEX idx_ttum_rule_config_product ON ttum_rule_config(product, side, exception_type);

-- ----------------------------------------------------------------------------
-- GL Mapping Master
-- ----------------------------------------------------------------------------

CREATE TABLE gl_mapping (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    gl_code VARCHAR(50) NOT NULL,
    gl_name VARCHAR(255) NOT NULL,
    gl_type VARCHAR(50) NOT NULL, -- SETTLEMENT, SUSPENSE, CHARGEBACK, FOREX, COMMISSION, COMPENSATION, ATM_CASH
    account_no VARCHAR(50) NOT NULL,
    branch_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE(product, gl_code, effective_from)
);

CREATE INDEX idx_gl_mapping_product ON gl_mapping(product, gl_type);

-- ----------------------------------------------------------------------------
-- TTUM Batch
-- ----------------------------------------------------------------------------

CREATE TABLE ttum_batch (
    id BIGSERIAL PRIMARY KEY,
    batch_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    business_date DATE NOT NULL,
    
    -- Batch details
    batch_name VARCHAR(255),
    sequence_no INTEGER,
    
    -- Status
    status ttum_status DEFAULT 'DRAFT',
    
    -- Control totals
    record_count INTEGER DEFAULT 0,
    dr_total DECIMAL(18,2) DEFAULT 0.00,
    cr_total DECIMAL(18,2) DEFAULT 0.00,
    
    -- Workflow
    maker VARCHAR(100),
    maker_at TIMESTAMP,
    checker VARCHAR(100),
    checker_at TIMESTAMP,
    
    -- Export
    export_format VARCHAR(20), -- CSV, FIXED_WIDTH, EXCEL
    export_file_path VARCHAR(1024),
    generated_at TIMESTAMP,
    
    -- Upload
    uploaded_at TIMESTAMP,
    upload_status VARCHAR(50),
    upload_response TEXT,
    
    -- CBS feedback
    cbs_feedback_file_id UUID,
    cbs_feedback_received_at TIMESTAMP,
    
    -- Re-generation
    parent_batch_id UUID REFERENCES ttum_batch(batch_id),
    is_regeneration BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ttum_batch_product_date ON ttum_batch(product, business_date);
CREATE INDEX idx_ttum_batch_status ON ttum_batch(status);

-- ----------------------------------------------------------------------------
-- TTUM Entry
-- ----------------------------------------------------------------------------

CREATE TABLE ttum_entry (
    id BIGSERIAL PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES ttum_batch(batch_id),
    entry_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Reference
    rrn VARCHAR(50),
    txn_id UUID REFERENCES txn_normalised(txn_id),
    exception_id UUID REFERENCES exception_history(exception_id),
    
    -- Account details
    account_no VARCHAR(50) NOT NULL,
    gl_account VARCHAR(50) NOT NULL,
    branch_code VARCHAR(20),
    
    -- Entry details
    dr_cr_flag dr_cr_flag NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    value_date DATE NOT NULL,
    particulars VARCHAR(500) NOT NULL,
    
    -- Product
    product_code VARCHAR(20),
    
    -- Status
    status ttum_status DEFAULT 'DRAFT',
    
    -- CBS feedback
    cbs_status VARCHAR(20),
    cbs_response_text TEXT,
    
    -- Comments
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ttum_entry_batch_id ON ttum_entry(batch_id);
CREATE INDEX idx_ttum_entry_rrn ON ttum_entry(rrn);
CREATE INDEX idx_ttum_entry_status ON ttum_entry(status);

-- ----------------------------------------------------------------------------
-- CBS Feedback
-- ----------------------------------------------------------------------------

CREATE TABLE cbs_feedback (
    id BIGSERIAL PRIMARY KEY,
    feedback_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    batch_id UUID NOT NULL REFERENCES ttum_batch(batch_id),
    file_id UUID REFERENCES file_register(file_id),
    
    -- Feedback details
    entry_id UUID REFERENCES ttum_entry(entry_id),
    serial_no INTEGER,
    account_no VARCHAR(50),
    gl_account VARCHAR(50),
    
    -- CBS response
    cbs_status VARCHAR(20) NOT NULL,
    cbs_response_code VARCHAR(20),
    cbs_response_text TEXT,
    
    -- Processing
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cbs_feedback_batch_id ON cbs_feedback(batch_id);
CREATE INDEX idx_cbs_feedback_entry_id ON cbs_feedback(entry_id);

-- ----------------------------------------------------------------------------
-- GL Balance Daily
-- ----------------------------------------------------------------------------

CREATE TABLE gl_balance_daily (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    gl_account VARCHAR(50) NOT NULL,
    gl_type VARCHAR(50) NOT NULL,
    business_date DATE NOT NULL,
    branch_code VARCHAR(20),
    
    -- Balances
    opening_balance DECIMAL(18,2) DEFAULT 0.00,
    dr_amount DECIMAL(18,2) DEFAULT 0.00,
    cr_amount DECIMAL(18,2) DEFAULT 0.00,
    closing_balance DECIMAL(18,2) DEFAULT 0.00,
    
    -- Expected closing (calculated)
    expected_closing_balance DECIMAL(18,2) DEFAULT 0.00,
    
    -- Difference
    difference_amount DECIMAL(18,2) DEFAULT 0.00,
    
    -- Components
    matched_amount DECIMAL(18,2) DEFAULT 0.00,
    ttum_posted_amount DECIMAL(18,2) DEFAULT 0.00,
    ttum_pending_amount DECIMAL(18,2) DEFAULT 0.00,
    suspense_amount DECIMAL(18,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, LOCKED
    
    -- Approval
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product, gl_account, business_date, branch_code)
);

CREATE INDEX idx_gl_balance_daily_product_date ON gl_balance_daily(product, business_date);
CREATE INDEX idx_gl_balance_daily_gl_account ON gl_balance_daily(gl_account, business_date);

-- ----------------------------------------------------------------------------
-- GL Difference
-- ----------------------------------------------------------------------------

CREATE TABLE gl_difference (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    gl_account VARCHAR(50) NOT NULL,
    business_date DATE NOT NULL,
    
    -- Difference details
    difference_amount DECIMAL(18,2) NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reason_description TEXT,
    
    -- Breakdown
    ttum_pending_amount DECIMAL(18,2) DEFAULT 0.00,
    ttum_failed_amount DECIMAL(18,2) DEFAULT 0.00,
    timing_difference_amount DECIMAL(18,2) DEFAULT 0.00,
    manual_cbs_entry_amount DECIMAL(18,2) DEFAULT 0.00,
    wrong_mapping_amount DECIMAL(18,2) DEFAULT 0.00,
    fees_booked_separately_amount DECIMAL(18,2) DEFAULT 0.00,
    unexplained_amount DECIMAL(18,2) DEFAULT 0.00,
    
    -- Exception linkage
    unmatched_count INTEGER DEFAULT 0,
    unmatched_amount DECIMAL(18,2) DEFAULT 0.00,
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gl_difference_product_date ON gl_difference(product, business_date);
CREATE INDEX idx_gl_difference_reason ON gl_difference(reason_code);
CREATE INDEX idx_gl_difference_resolved ON gl_difference(is_resolved) WHERE is_resolved = false;

-- ----------------------------------------------------------------------------
-- Dispute Case
-- ----------------------------------------------------------------------------

CREATE TABLE dispute_case (
    id BIGSERIAL PRIMARY KEY,
    dispute_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    
    -- Reference
    rrn VARCHAR(50),
    txn_id UUID REFERENCES txn_normalised(txn_id),
    amount DECIMAL(18,2),
    
    -- Dispute details
    dispute_type dispute_type NOT NULL,
    dispute_category VARCHAR(100),
    dispute_reason TEXT NOT NULL,
    
    -- Parties
    customer_name VARCHAR(255),
    customer_account VARCHAR(50),
    customer_contact VARCHAR(20),
    customer_email VARCHAR(255),
    
    -- Branch
    branch_code VARCHAR(20),
    branch_name VARCHAR(255),
    
    -- Status
    status dispute_status DEFAULT 'RAISED',
    
    -- Workflow
    raised_by VARCHAR(100) NOT NULL,
    raised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_by VARCHAR(100),
    validated_at TIMESTAMP,
    filed_by VARCHAR(100),
    filed_at TIMESTAMP,
    
    -- NPCI submission
    npci_reference VARCHAR(100),
    npci_submission_method VARCHAR(50), -- API, PORTAL
    npci_submitted_at TIMESTAMP,
    
    -- Resolution
    resolution VARCHAR(100),
    resolution_amount DECIMAL(18,2),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    
    -- TAT
    tat_deadline TIMESTAMP,
    tat_breach BOOLEAN DEFAULT false,
    
    -- TTUM linkage
    ttum_batch_id BIGINT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_case_product ON dispute_case(product);
CREATE INDEX idx_dispute_case_status ON dispute_case(status);
CREATE INDEX idx_dispute_case_rrn ON dispute_case(rrn);
CREATE INDEX idx_dispute_case_raised_by ON dispute_case(raised_by);
CREATE INDEX idx_dispute_case_tat ON dispute_case(tat_deadline) WHERE status NOT IN ('CLOSED', 'WITHDRAWN');

-- ----------------------------------------------------------------------------
-- Dispute History
-- ----------------------------------------------------------------------------

CREATE TABLE dispute_history (
    id BIGSERIAL PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES dispute_case(dispute_id),
    
    -- Status change
    old_status dispute_status,
    new_status dispute_status NOT NULL,
    
    -- Action
    action VARCHAR(100) NOT NULL,
    action_notes TEXT,
    
    -- Actor
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Evidence
    document_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_history_dispute_id ON dispute_history(dispute_id);

-- ----------------------------------------------------------------------------
-- Dispute Document
-- ----------------------------------------------------------------------------

CREATE TABLE dispute_document (
    id BIGSERIAL PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES dispute_case(dispute_id),
    document_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Document details
    document_type VARCHAR(50) NOT NULL, -- EVIDENCE, SCREENSHOT, RECEIPT, etc.
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(1024) NOT NULL,
    document_size BIGINT,
    document_format VARCHAR(20), -- PDF, JPG, PNG, etc.
    
    -- Metadata
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_document_dispute_id ON dispute_document(dispute_id);

-- ----------------------------------------------------------------------------
-- NPCI Submission
-- ----------------------------------------------------------------------------

CREATE TABLE npci_submission (
    id BIGSERIAL PRIMARY KEY,
    submission_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    dispute_id UUID REFERENCES dispute_case(dispute_id),
    
    -- Submission details
    submission_type VARCHAR(50) NOT NULL, -- CHARGEBACK, PRE_ARBITRATION, etc.
    submission_method VARCHAR(50) NOT NULL, -- API, PORTAL_ASSISTED
    
    -- NPCI reference
    npci_reference VARCHAR(100),
    npci_status VARCHAR(50),
    
    -- Payload
    request_payload JSONB,
    response_payload JSONB,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_received_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, ACCEPTED, REJECTED, PENDING
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_npci_submission_dispute_id ON npci_submission(dispute_id);
CREATE INDEX idx_npci_submission_reference ON npci_submission(npci_reference);

-- ----------------------------------------------------------------------------
-- User Management
-- ----------------------------------------------------------------------------

CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Role
    role VARCHAR(50) NOT NULL, -- Admin, L1, L2, L3, Auditor
    title VARCHAR(100),
    
    -- Status
    status user_status DEFAULT 'ACTIVE',
    
    -- Authentication
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- MFA
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    
    -- Department
    department VARCHAR(100),
    branch_code VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_app_user_username ON app_user(username);
CREATE INDEX idx_app_user_role ON app_user(role);
CREATE INDEX idx_app_user_status ON app_user(status);

-- ----------------------------------------------------------------------------
-- Role Permission
-- ----------------------------------------------------------------------------

CREATE TABLE role_permission (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role, permission, module)
);

CREATE INDEX idx_role_permission_role ON role_permission(role);

-- Seed default permissions
INSERT INTO role_permission (role, permission, module, description) VALUES
('Admin', 'ALL', 'ALL', 'Full system access'),
('L1', 'VIEW_RECON', 'RECON', 'View reconciliation results'),
('L1', 'VIEW_EXCEPTIONS', 'EXCEPTION', 'View exceptions'),
('L1', 'CREATE_TTUM', 'TTUM', 'Create TTUM (maker)'),
('L2', 'APPROVE_TTUM', 'TTUM', 'Approve TTUM (checker)'),
('L2', 'RESOLVE_EXCEPTIONS', 'EXCEPTION', 'Resolve exceptions'),
('L3', 'CONFIGURE_SYSTEM', 'ADMIN', 'Configure system settings'),
('Auditor', 'VIEW_ALL', 'ALL', 'Read-only access to all data');

-- ----------------------------------------------------------------------------
-- Expected File Calendar
-- ----------------------------------------------------------------------------

CREATE TABLE expected_file_calendar (
    id BIGSERIAL PRIMARY KEY,
    product product_type NOT NULL,
    source source_type NOT NULL,
    cycle_no INTEGER,
    
    -- File expectations
    expected_file_pattern VARCHAR(255) NOT NULL,
    expected_by_time TIME NOT NULL,
    
    -- Alert configuration
    alert_if_missing BOOLEAN DEFAULT true,
    alert_after_minutes INTEGER DEFAULT 30,
    
    -- Active days
    active_days JSONB DEFAULT '[1,2,3,4,5,6,7]', -- Days of week (1=Monday, 7=Sunday)
    
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product, source, cycle_no, effective_from)
);

CREATE INDEX idx_expected_file_calendar_product ON expected_file_calendar(product, source);

-- ----------------------------------------------------------------------------
-- Notification Log
-- ----------------------------------------------------------------------------

CREATE TABLE notification_log (
    id BIGSERIAL PRIMARY KEY,
    notification_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL, -- EMAIL, SMS, IN_APP
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    
    -- Trigger
    trigger_event VARCHAR(100) NOT NULL, -- FILE_MISSING, EXCEPTION_TAT_BREACH, etc.
    trigger_entity_id UUID,
    trigger_entity_type VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    sent_at TIMESTAMP,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_log_recipient ON notification_log(recipient);
CREATE INDEX idx_notification_log_status ON notification_log(status);
CREATE INDEX idx_notification_log_trigger ON notification_log(trigger_event);

-- ----------------------------------------------------------------------------
-- Audit Log
-- ----------------------------------------------------------------------------

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    audit_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- User
    user_id UUID REFERENCES app_user(user_id),
    username VARCHAR(100),
    user_role VARCHAR(50),
    
    -- Action
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_value JSONB,
    new_value JSONB,
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Timestamp
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partition by date (range)
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_performed_at ON audit_log(performed_at);

-- ----------------------------------------------------------------------------
-- Settlement Verification
-- ----------------------------------------------------------------------------

CREATE TABLE settlement_verification (
    id BIGSERIAL PRIMARY KEY,
    verification_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    product product_type NOT NULL,
    business_date DATE NOT NULL,
    cycle_no INTEGER,
    
    -- NPCI settlement
    npci_settlement_amount DECIMAL(18,2) NOT NULL,
    npci_settlement_file_id UUID REFERENCES file_register(file_id),
    
    -- Bank settlement account
    bank_settlement_account VARCHAR(50) NOT NULL,
    bank_settlement_amount DECIMAL(18,2) NOT NULL,
    bank_statement_file_id UUID REFERENCES file_register(file_id),
    
    -- Verification
    difference_amount DECIMAL(18,2) DEFAULT 0.00,
    is_matched BOOLEAN DEFAULT false,
    
    -- Forex (for VISA)
    exchange_rate DECIMAL(10,6),
    txn_currency VARCHAR(3),
    billing_currency VARCHAR(3),
    forex_difference DECIMAL(18,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, DIFFERENCE, ERROR
    
    -- Resolution
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product, business_date, cycle_no)
);

CREATE INDEX idx_settlement_verification_product_date ON settlement_verification(product, business_date);
CREATE INDEX idx_settlement_verification_status ON settlement_verification(status);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active exceptions by ageing
CREATE VIEW v_active_exceptions_by_ageing AS
SELECT
    product,
    exception_type,
    owner,
    COUNT(*) FILTER WHERE age_days = 0 AS age_t0,
    COUNT(*) FILTER WHERE age_days = 1 AS age_t1,
    COUNT(*) FILTER WHERE age_days BETWEEN 2 AND 7 AS age_t2_7,
    COUNT(*) FILTER WHERE age_days > 7 AS age_t7_plus,
    SUM(amount) FILTER WHERE age_days = 0 AS amount_t0,
    SUM(amount) FILTER WHERE age_days = 1 AS amount_t1,
    SUM(amount) FILTER WHERE age_days BETWEEN 2 AND 7 AS amount_t2_7,
    SUM(amount) FILTER WHERE age_days > 7 AS amount_t7_plus
FROM exception_history
WHERE status = 'OPEN'
GROUP BY product, exception_type, owner;

-- View: Daily reconciliation summary
CREATE VIEW v_daily_recon_summary AS
SELECT
    business_date,
    product,
    side,
    SUM(matched_count) AS total_matched,
    SUM(unmatched_count) AS total_unmatched,
    SUM(partial_match_count) AS total_partial,
    SUM(matched_amount) AS total_matched_amount,
    SUM(unmatched_amount) AS total_unmatched_amount,
    (SUM(matched_count)::FLOAT / NULLIF(SUM(matched_count + unmatched_count + partial_match_count), 0) * 100) AS match_percentage
FROM recon_summary
GROUP BY business_date, product, side;

-- View: TTUM pending approval
CREATE VIEW v_ttum_pending_approval AS
SELECT
    tb.id,
    tb.batch_id,
    tb.product,
    tb.business_date,
    tb.status,
    tb.record_count,
    tb.dr_total,
    tb.cr_total,
    tb.maker,
    tb.maker_at,
    COUNT(te.id) AS entry_count
FROM ttum_batch tb
LEFT JOIN ttum_entry te ON tb.batch_id = te.batch_id
WHERE tb.status = 'SUBMITTED'
GROUP BY tb.id, tb.batch_id, tb.product, tb.business_date, tb.status, tb.record_count, tb.dr_total, tb.cr_total, tb.maker, tb.maker_at;

-- View: GL difference summary
CREATE VIEW v_gl_difference_summary AS
SELECT
    business_date,
    product,
    gl_type,
    SUM(difference_amount) AS total_difference,
    SUM(unexplained_amount) AS total_unexplained,
    COUNT(*) AS difference_count
FROM gl_difference gd
JOIN gl_mapping gm ON gd.gl_account = gm.gl_account AND gd.product = gm.product
WHERE NOT gd.is_resolved
GROUP BY business_date, product, gl_type;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trigger_update_file_config BEFORE UPDATE ON file_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_file_register BEFORE UPDATE ON file_register
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_txn_normalised BEFORE UPDATE ON txn_normalised
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_match_rule_config BEFORE UPDATE ON match_rule_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_recon_result BEFORE UPDATE ON recon_result
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_recon_summary BEFORE UPDATE ON recon_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_exception_history BEFORE UPDATE ON exception_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ttum_rule_config BEFORE UPDATE ON ttum_rule_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_gl_mapping BEFORE UPDATE ON gl_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ttum_batch BEFORE UPDATE ON ttum_batch
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ttum_entry BEFORE UPDATE ON ttum_entry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_gl_balance_daily BEFORE UPDATE ON gl_balance_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_gl_difference BEFORE UPDATE ON gl_difference
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_dispute_case BEFORE UPDATE ON dispute_case
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_npci_submission BEFORE UPDATE ON npci_submission
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_app_user BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_role_permission BEFORE UPDATE ON role_permission
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_expected_file_calendar BEFORE UPDATE ON expected_file_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_settlement_verification BEFORE UPDATE ON settlement_verification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE file_config IS 'Configuration for file formats, field mappings, and validation rules per product and source';
COMMENT ON TABLE file_register IS 'Registry of all ingested files with metadata and status';
COMMENT ON TABLE raw_records IS 'Staging table for raw file records before normalisation';
COMMENT ON TABLE reject_records IS 'Records that failed validation or parsing';
COMMENT ON TABLE txn_normalised IS 'Core table with normalised transaction data in common schema';
COMMENT ON TABLE match_rule_config IS 'Configuration for match keys, hierarchies, and fuzzy matching rules';
COMMENT ON TABLE recon_result IS 'Transaction-level reconciliation results';
COMMENT ON TABLE recon_summary IS 'Aggregated reconciliation summary by product, date, and cycle';
COMMENT ON TABLE exception_master IS 'Master table for exception types with default actions and TAT';
COMMENT ON TABLE exception_history IS 'Exception records with workflow status and ageing';
COMMENT ON TABLE ttum_rule_config IS 'Configuration for TTUM generation rules per product and exception type';
COMMENT ON TABLE gl_mapping IS 'Master GL account mapping per product and GL type';
COMMENT ON TABLE ttum_batch IS 'TTUM batch with maker-checker workflow';
COMMENT ON TABLE ttum_entry IS 'Individual TTUM entries within a batch';
COMMENT ON TABLE cbs_feedback IS 'CBS response to TTUM upload';
COMMENT ON TABLE gl_balance_daily IS 'Daily GL balance with expected vs actual comparison';
COMMENT ON TABLE gl_difference IS 'GL difference records with reason codes and resolution';
COMMENT ON TABLE dispute_case IS 'Dispute and chargeback cases';
COMMENT ON TABLE dispute_history IS 'History of status changes for disputes';
COMMENT ON TABLE dispute_document IS 'Documents attached to disputes';
COMMENT ON TABLE npci_submission IS 'NPCI submission records for disputes';
COMMENT ON TABLE app_user IS 'User accounts with roles and permissions';
COMMENT ON TABLE role_permission IS 'Role-based permissions';
COMMENT ON TABLE expected_file_calendar IS 'Calendar of expected files per product, source, and cycle';
COMMENT ON TABLE notification_log IS 'Log of all notifications sent';
COMMENT ON TABLE audit_log IS 'Immutable audit log of all system actions';
COMMENT ON TABLE settlement_verification IS 'Verification of NPCI settlement vs bank settlement account';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
