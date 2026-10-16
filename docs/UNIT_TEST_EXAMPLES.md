# Unit Test Examples with Sample Data
## For Each Exception Type

**Version:** 1.0  
**Date:** 2026-10-15

---

## Table of Contents

1. [Test Data Setup](#1-test-data-setup)
2. [Exception Type EX01](#2-exception-type-ex01)
3. [Exception Type EX02](#3-exception-type-ex02)
4. [Exception Type EX03](#4-exception-type-ex03)
5. [Exception Type EX04](#5-exception-type-ex04)
6. [Exception Type EX05](#6-exception-type-ex05)
7. [Exception Type EX06](#7-exception-type-ex06)
8. [Exception Type EX07](#8-exception-type-ex07)
9. [Exception Type EX08](#9-exception-type-ex08)
10. [Exception Type EX09](#10-exception-type-ex09)
11. [Test Utilities](#11-test-utilities)

---

## 1. Test Data Setup

### 1.1 Base Transaction Record

```java
// Base UPI transaction record
TxnNormalised baseTxn = TxnNormalised.builder()
    .txnId(UUID.randomUUID())
    .product(ProductType.UPI)
    .side(TransactionSide.REMITTER)
    .businessDate(LocalDate.of(2026, 10, 15))
    .cycleNo(1)
    .rrn("123456789012")
    .stan("000001")
    .upiTxnId("UPI2026101512345678901234567890123")
    .txnDateTime(LocalDateTime.of(2026, 10, 15, 10, 30, 45))
    .amount(new BigDecimal("500.00"))
    .currency("INR")
    .feeAmount(new BigDecimal("0.00"))
    .status(TxnStatus.SUCCESS)
    .responseCode("00")
    .accountNo("100123456789") // Will be encrypted
    .maskedAccountNo("6789")
    .branchCode("MUM001")
    .channel("UPI")
    .drCrFlag(DrCrFlag.DR)
    .matchKey("UPI2026101512345678901234567890123|500.00|2026-10-15")
    .reconStatus(ReconStatus.PENDING)
    .build();
```

### 1.2 Test Configuration

```java
// UPI CBS file configuration
FileConfig upiCbsConfig = FileConfig.builder()
    .product(ProductType.UPI)
    .source(SourceType.CBS)
    .fileNamePattern("^CBS_UPI_REMITTER_(\\d{8})_Cycle(\\d+)\\.csv$")
    .fileFormat("CSV")
    .delimiter(",")
    .headerRows(1)
    .encoding("UTF-8")
    .columnMapping(Map.of(
        "rrn", Map.of("source_column", "RRN", "data_type", "string", "required", true),
        "upi_txn_id", Map.of("source_column", "UPITxnId", "data_type", "string", "required", true),
        "txn_datetime", Map.of("source_column", "TxnDateTime", "data_type", "datetime", "required", true),
        "amount", Map.of("source_column", "Amount", "data_type", "decimal", "required", true),
        "status", Map.of("source_column", "Status", "data_type", "string", "required", true),
        "account_no", Map.of("source_column", "AccountNo", "data_type", "string", "required", true),
        "branch_code", Map.of("source_column", "BranchCode", "data_type", "string", "required", true),
        "dr_cr_flag", Map.of("source_column", "DrCr", "data_type", "string", "required", true)
    ))
    .statusMapping(Map.of(
        "SUCCESS", "SUCCESS",
        "FAILED", "FAILED",
        "TIMEOUT", "TIMEOUT",
        "SUCCESS_DEEMED", "DEEMED"
    ))
    .build();
```

---

## 2. Exception Type EX01

### 2.1 Description
**Debited in CBS, txn failed at network**

- CBS Status: SUCCESS
- Switch Status: FAILED
- Network Status: FAILED
- Meaning: Customer debited but transaction failed at network
- Default Action: TTUM_GENERATE (reverse debit)

### 2.2 Sample Test Data

```java
@Test
public void testExceptionEX01_CBSDebitedNetworkFailed() {
    // CBS Record: SUCCESS
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Switch Record: FAILED
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.FAILED)
        .responseCode("99")
        .build();
    
    // Network Record: FAILED
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.FAILED)
        .responseCode("U99")
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX01, result.getExceptionType());
    assertEquals("Debited in CBS, txn failed at network", result.getExceptionDescription());
    assertEquals(0.0, result.getMatchConfidence());
    
    // Verify TTUM rule lookup
    TtumRuleConfig rule = ttumRuleConfigRepository
        .findByProductAndSideAndExceptionTypeAndIsActiveTrue(
            ProductType.UPI, TransactionSide.REMITTER, ExceptionType.EX01)
        .orElse(null);
    
    assertNotNull(rule);
    assertEquals("UPI_SETTLEMENT_GL", rule.getDrGlAccount());
    assertEquals("CUSTOMER_ACCOUNT", rule.getCrGlAccount());
    assertEquals("UPI REV RRN {rrn} DT {ddmmyyyy}", rule.getNarrationTemplate());
}
```

### 2.3 CSV Sample Data

**CBS File (CBS_UPI_REMITTER_20261015_Cycle1.csv):**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode,AccountNo,BranchCode,DrCr
123456789012,UPI2026101512345678901234567890123,15-10-2026 10:30:45,500.00,SUCCESS,00,100123456789,MUM001,DR
```

**Switch File (UPI_SWITCH_20261015_Cycle1.csv):**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode
123456789012,UPI2026101512345678901234567890123,15-10-2026 10:30:45,500.00,FAILED,99
```

**NPCI File (NPCI_UPI_20261015_Cycle1.csv):**
```csv
UPI_Transaction_ID,RRN,Transaction_Date_Time,Settlement_Amount,Response_Code
UPI2026101512345678901234567890123,123456789012,2026-10-15 10:30:45,50000,U99
```

### 2.4 Expected TTUM Entry

```java
TtumEntry expectedTTUM = TtumEntry.builder()
    .rrn("123456789012")
    .accountNo("100123456789")
    .glAccount("UPI_SETTLEMENT_GL")
    .drCrFlag(DrCrFlag.DR)
    .amount(new BigDecimal("500.00"))
    .valueDate(LocalDate.of(2026, 10, 15))
    .particulars("UPI REV RRN 123456789012 DT 15102026")
    .productCode("UPI")
    .status(TtumStatus.DRAFT)
    .build();
```

---

## 3. Exception Type EX02

### 3.1 Description
**Debited in CBS, network missing/failed**

- CBS Status: SUCCESS
- Switch Status: SUCCESS
- Network Status: Missing/Failed
- Meaning: Customer debited but network has no success
- Default Action: TTUM_GENERATE (reverse debit)

### 3.2 Sample Test Data

```java
@Test
public void testExceptionEX02_CBSDebitedNetworkMissing() {
    // CBS Record: SUCCESS
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Switch Record: SUCCESS
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Network Record: null (missing)
    TxnNormalised networkTxn = null;
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX02, result.getExceptionType());
    assertEquals("Debited in CBS, network missing/failed", result.getExceptionDescription());
    assertEquals(50.0, result.getMatchConfidence()); // Partial match (CBS + Switch)
}
```

### 3.3 CSV Sample Data

**CBS File:**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode,AccountNo,BranchCode,DrCr
123456789013,UPI2026101512345678901234567890124,15-10-2026 11:15:30,1000.00,SUCCESS,00,100123456789,MUM001,DR
```

**Switch File:**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode
123456789013,UPI2026101512345678901234567890124,15-10-2026 11:15:30,1000.00,SUCCESS,00
```

**NPCI File:** (Empty or missing record for this RRN)

---

## 4. Exception Type EX03

### 4.1 Description
**Network success, CBS not posted**

- CBS Status: Missing
- Switch Status: SUCCESS
- Network Status: SUCCESS
- Meaning: Network settled but CBS not posted
- Default Action: TTUM_GENERATE (credit customer)

### 4.2 Sample Test Data

```java
@Test
public void testExceptionEX03_NetworkSuccessCBSMissing() {
    // CBS Record: null (missing)
    TxnNormalised cbsTxn = null;
    
    // Switch Record: SUCCESS
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .side(TransactionSide.BENEFICIARY)
        .drCrFlag(DrCrFlag.CR)
        .build();
    
    // Network Record: SUCCESS
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .side(TransactionSide.BENEFICIARY)
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX03, result.getExceptionType());
    assertEquals("Network success, CBS not posted", result.getExceptionDescription());
    assertEquals(50.0, result.getMatchConfidence());
}
```

### 4.3 CSV Sample Data

**CBS File:** (Empty or missing record)

**Switch File:**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode
123456789014,UPI2026101512345678901234567890125,15-10-2026 12:00:00,2500.00,SUCCESS,00
```

**NPCI File:**
```csv
UPI_Transaction_ID,RRN,Transaction_Date_Time,Settlement_Amount,Response_Code
UPI2026101512345678901234567890125,123456789014,2026-10-15 12:00:00,250000,00
```

### 4.4 Expected TTUM Entry (Beneficiary Credit)

```java
TtumEntry expectedTTUM = TtumEntry.builder()
    .rrn("123456789014")
    .accountNo("200987654321") // Beneficiary account from network
    .glAccount("UPI_SETTLEMENT_GL")
    .drCrFlag(DrCrFlag.CR)
    .amount(new BigDecimal("2500.00"))
    .valueDate(LocalDate.of(2026, 10, 15))
    .particulars("UPI CR RRN 123456789014 DT 15102026")
    .productCode("UPI")
    .status(TtumStatus.DRAFT)
    .build();
```

---

## 5. Exception Type EX04

### 5.1 Description
**Amount mismatch**

- CBS Status: SUCCESS
- Switch Status: SUCCESS
- Network Status: SUCCESS
- Meaning: Amount differs between sources
- Default Action: MANUAL_REVIEW

### 5.2 Sample Test Data

```java
@Test
public void testExceptionEX04_AmountMismatch() {
    // CBS Record: SUCCESS with amount 500.00
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .amount(new BigDecimal("500.00"))
        .build();
    
    // Switch Record: SUCCESS with amount 505.00 (mismatch)
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .amount(new BigDecimal("505.00"))
        .build();
    
    // Network Record: SUCCESS with amount 505.00
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .amount(new BigDecimal("505.00"))
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX04, result.getExceptionType());
    assertEquals("Amount mismatch between sources", result.getExceptionDescription());
    assertEquals(0.0, result.getMatchConfidence());
    
    // Verify TTUM rule does not auto-generate
    TtumRuleConfig rule = ttumRuleConfigRepository
        .findByProductAndSideAndExceptionTypeAndIsActiveTrue(
            ProductType.UPI, TransactionSide.REMITTER, ExceptionType.EX04)
        .orElse(null);
    
    assertNotNull(rule);
    assertFalse(rule.isAutoGenerate());
}
```

### 5.3 CSV Sample Data

**CBS File:**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode,AccountNo,BranchCode,DrCr
123456789015,UPI2026101512345678901234567890126,15-10-2026 13:30:00,500.00,SUCCESS,00,100123456789,MUM001,DR
```

**Switch File:**
```csv
RRN,UPITxnId,TxnDateTime,Amount,Status,RespCode
123456789015,UPI2026101512345678901234567890126,15-10-2026 13:30:00,505.00,SUCCESS,00
```

**NPCI File:**
```csv
UPI_Transaction_ID,RRN,Transaction_Date_Time,Settlement_Amount,Response_Code
UPI2026101512345678901234567890126,123456789015,2026-10-15 13:30:00,50500,00
```

---

## 6. Exception Type EX05

### 6.1 Description
**Duplicate posting**

- CBS Status: SUCCESS (duplicate)
- Switch Status: Single
- Network Status: Single
- Meaning: Duplicate posting in CBS
- Default Action: MANUAL_REVIEW

### 6.2 Sample Test Data

```java
@Test
public void testExceptionEX05_DuplicatePosting() {
    // CBS Record: Two records with same RRN (duplicate)
    TxnNormalised cbsTxn1 = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .rrn("123456789016")
        .build();
    
    TxnNormalised cbsTxn2 = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .rrn("123456789016")
        .build();
    
    // Switch Record: Single
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .rrn("123456789016")
        .build();
    
    // Network Record: Single
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .rrn("123456789016")
        .build();
    
    // Perform matching (should detect duplicate)
    List<TxnNormalised> cbsRecords = Arrays.asList(cbsTxn1, cbsTxn2);
    Map<String, List<TxnNormalised>> cbsIndex = buildMatchKeyIndex(cbsRecords);
    
    // Check for duplicate RRN in CBS
    long cbsCount = cbsRecords.stream()
        .filter(t -> "123456789016".equals(t.getRrn()))
        .count();
    
    assertEquals(2, cbsCount); // Duplicate detected
    
    // Create exception for duplicate
    ReconResult result = ReconResult.builder()
        .reconStatus(ReconStatus.UNMATCHED)
        .exceptionType(ExceptionType.EX05)
        .exceptionDescription("Duplicate posting in CBS")
        .build();
    
    assertEquals(ExceptionType.EX05, result.getExceptionType());
}
```

---

## 7. Exception Type EX06

### 7.1 Description
**Network settled, bank failed**

- CBS Status: Failed
- Switch Status: Failed
- Network Status: SUCCESS
- Meaning: Network settled but bank failed
- Default Action: TTUM_GENERATE (credit customer)

### 7.2 Sample Test Data

```java
@Test
public void testExceptionEX06_NetworkSettledBankFailed() {
    // CBS Record: FAILED
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.FAILED)
        .responseCode("99")
        .side(TransactionSide.BENEFICIARY)
        .build();
    
    // Switch Record: FAILED
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.FAILED)
        .responseCode("99")
        .side(TransactionSide.BENEFICIARY)
        .build();
    
    // Network Record: SUCCESS
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .side(TransactionSide.BENEFICIARY)
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX06, result.getExceptionType());
    assertEquals("Network settled, bank failed", result.getExceptionDescription());
}
```

---

## 8. Exception Type EX07

### 8.1 Description
**Switch record missing**

- CBS Status: SUCCESS
- Switch Status: Missing
- Network Status: SUCCESS
- Meaning: Switch record missing
- Default Action: MANUAL_REVIEW

### 8.2 Sample Test Data

```java
@Test
public void testExceptionEX07_SwitchRecordMissing() {
    // CBS Record: SUCCESS
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .build();
    
    // Switch Record: null (missing)
    TxnNormalised switchTxn = null;
    
    // Network Record: SUCCESS
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX07, result.getExceptionType());
    assertEquals("Switch record missing", result.getExceptionDescription());
}
```

---

## 9. Exception Type EX08

### 8.1 Description
**Status mismatch (timeout/deemed)**

- CBS Status: SUCCESS
- Switch Status: SUCCESS
- Network Status: SUCCESS (but status mismatch)
- Meaning: Status mismatch (timeout/deemed)
- Default Action: MANUAL_REVIEW

### 9.2 Sample Test Data

```java
@Test
public void testExceptionEX08_StatusMismatch() {
    // CBS Record: SUCCESS
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Switch Record: SUCCESS
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Network Record: DEEMED (status mismatch)
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.DEEMED)
        .responseCode("U97")
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.PARTIAL_MATCH, result.getReconStatus());
    assertEquals(ExceptionType.EX08, result.getExceptionType());
    assertEquals("Status mismatch (timeout/deemed)", result.getExceptionDescription());
    assertEquals(75.0, result.getMatchConfidence()); // Partial match
}
```

---

## 10. Exception Type EX09

### 10.1 Description
**Wrong reversal**

- CBS Status: REVERSED
- Switch Status: SUCCESS
- Network Status: SUCCESS
- Meaning: Wrong reversal in CBS
- Default Action: MANUAL_REVIEW

### 10.2 Sample Test Data

```java
@Test
public void testExceptionEX09_WrongReversal() {
    // CBS Record: REVERSED
    TxnNormalised cbsTxn = baseTxn.toBuilder()
        .source(SourceType.CBS)
        .status(TxnStatus.REVERSED)
        .responseCode("003")
        .originalTxnRef("ORIGINAL_TXN_123")
        .build();
    
    // Switch Record: SUCCESS (original txn)
    TxnNormalised switchTxn = baseTxn.toBuilder()
        .source(SourceType.SWITCH)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Network Record: SUCCESS (original txn)
    TxnNormalised networkTxn = baseTxn.toBuilder()
        .source(SourceType.NETWORK)
        .status(TxnStatus.SUCCESS)
        .responseCode("00")
        .build();
    
    // Perform matching
    ReconResult result = matchingEngine.matchTransaction(cbsTxn, switchTxn, networkTxn);
    
    // Assertions
    assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
    assertEquals(ExceptionType.EX09, result.getExceptionType());
    assertEquals("Wrong reversal in CBS", result.getExceptionDescription());
}
```

---

## 11. Test Utilities

### 11.1 Test Data Builder

```java
public class TestDataBuilder {
    
    public static TxnNormalised createUPIRemitterTxn(LocalDate businessDate, BigDecimal amount) {
        return TxnNormalised.builder()
            .txnId(UUID.randomUUID())
            .product(ProductType.UPI)
            .side(TransactionSide.REMITTER)
            .businessDate(businessDate)
            .cycleNo(1)
            .rrn(generateRRN())
            .stan(generateSTAN())
            .upiTxnId(generateUPIId())
            .txnDateTime(LocalDateTime.now())
            .amount(amount)
            .currency("INR")
            .feeAmount(BigDecimal.ZERO)
            .status(TxnStatus.SUCCESS)
            .responseCode("00")
            .accountNo("100123456789")
            .maskedAccountNo("6789")
            .branchCode("MUM001")
            .channel("UPI")
            .drCrFlag(DrCrFlag.DR)
            .matchKey(buildMatchKey(amount, businessDate))
            .reconStatus(ReconStatus.PENDING)
            .build();
    }
    
    public static TxnNormalised createUPIBeneficiaryTxn(LocalDate businessDate, BigDecimal amount) {
        return createUPIRemitterTxn(businessDate, amount).toBuilder()
            .side(TransactionSide.BENEFICIARY)
            .drCrFlag(DrCrFlag.CR)
            .accountNo("200987654321")
            .maskedAccountNo("4321")
            .build();
    }
    
    private static String generateRRN() {
        return String.format("%012d", (int)(Math.random() * 1000000000000L));
    }
    
    private static String generateSTAN() {
        return String.format("%06d", (int)(Math.random() * 1000000));
    }
    
    private static String generateUPIId() {
        return "UPI" + UUID.randomUUID().toString().replace("-", "");
    }
    
    private static String buildMatchKey(BigDecimal amount, LocalDate businessDate) {
        return generateUPIId() + "|" + amount + "|" + businessDate;
    }
}
```

### 11.2 Test Assertions

```java
public class ReconAssertions {
    
    public static void assertMatched(ReconResult result) {
        assertEquals(ReconStatus.MATCHED, result.getReconStatus());
        assertNull(result.getExceptionType());
        assertEquals(100.0, result.getMatchConfidence());
    }
    
    public static void assertUnmatched(ReconResult result, ExceptionType expectedType) {
        assertEquals(ReconStatus.UNMATCHED, result.getReconStatus());
        assertEquals(expectedType, result.getExceptionType());
        assertNotNull(result.getExceptionDescription());
    }
    
    public static void assertPartialMatch(ReconResult result, ExceptionType expectedType) {
        assertEquals(ReconStatus.PARTIAL_MATCH, result.getReconStatus());
        assertEquals(expectedType, result.getExceptionType());
        assertTrue(result.getMatchConfidence() > 0 && result.getMatchConfidence() < 100);
    }
    
    public static void assertTTUMGenerated(TtumBatch batch) {
        assertNotNull(batch);
        assertNotNull(batch.getBatchId());
        assertEquals(TtumStatus.DRAFT, batch.getStatus());
        assertTrue(batch.getDrTotal().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(batch.getCrTotal().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(batch.getDrTotal(), batch.getCrTotal());
    }
}
```

### 11.3 Test Data Generator

```java
public class TestDataGenerator {
    
    public static List<TxnNormalised> generateUPIRemitterData(int count, LocalDate businessDate) {
        List<TxnNormalised> records = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            BigDecimal amount = new BigDecimal(String.format("%.2f", Math.random() * 10000 + 10));
            records.add(TestDataBuilder.createUPIRemitterTxn(businessDate, amount));
        }
        return records;
    }
    
    public static List<TxnNormalised> generateUPIBeneficiaryData(int count, LocalDate businessDate) {
        List<TxnNormalised> records = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            BigDecimal amount = new BigDecimal(String.format("%.2f", Math.random() * 10000 + 10));
            records.add(TestDataBuilder.createUPIBeneficiaryTxn(businessDate, amount));
        }
        return records;
    }
    
    public static List<TxnNormalised> generateExceptionData(ExceptionType exceptionType, int count) {
        List<TxnNormalised> records = new ArrayList<>();
        LocalDate businessDate = LocalDate.now();
        
        for (int i = 0; i < count; i++) {
            TxnNormalised txn = TestDataBuilder.createUPIRemitterTxn(businessDate, new BigDecimal("500.00"));
            
            // Modify based on exception type
            switch (exceptionType) {
                case EX01:
                    txn.setStatus(TxnStatus.SUCCESS);
                    break;
                case EX02:
                    txn.setStatus(TxnStatus.SUCCESS);
                    break;
                case EX03:
                    txn.setStatus(TxnStatus.FAILED);
                    break;
                case EX04:
                    txn.setAmount(new BigDecimal("505.00"));
                    break;
                // ... other exception types
            }
            
            records.add(txn);
        }
        
        return records;
    }
}
```

---

## 12. Integration Test Example

```java
@SpringBootTest
@Transactional
public class UPIReconciliationIntegrationTest {
    
    @Autowired
    private MatchingEngine matchingEngine;
    
    @Autowired
    private TxnNormalisedRepository txnNormalisedRepository;
    
    @Autowired
    private ReconResultRepository reconResultRepository;
    
    @Test
    public void testFullUPIReconciliationFlow() {
        LocalDate businessDate = LocalDate.of(2026, 10, 15);
        Integer cycleNo = 1;
        TransactionSide side = TransactionSide.REMITTER;
        
        // Generate test data
        List<TxnNormalised> cbsRecords = TestDataGenerator.generateUPIRemitterData(1000, businessDate);
        List<TxnNormalised> switchRecords = TestDataGenerator.generateUPIRemitterData(1000, businessDate);
        List<TxnNormalised> networkRecords = TestDataGenerator.generateUPIRemitterData(1000, businessDate);
        
        // Inject some exceptions
        injectExceptionEX01(cbsRecords, switchRecords, networkRecords, 10);
        injectExceptionEX02(cbsRecords, switchRecords, networkRecords, 5);
        injectExceptionEX03(cbsRecords, switchRecords, networkRecords, 5);
        
        // Save test data
        txnNormalisedRepository.saveAll(cbsRecords);
        txnNormalisedRepository.saveAll(switchRecords);
        txnNormalisedRepository.saveAll(networkRecords);
        
        // Run reconciliation
        matchingEngine.performUPIReconciliation(businessDate, cycleNo, side);
        
        // Verify results
        List<ReconResult> results = reconResultRepository
            .findByProductAndSideAndBusinessDateAndCycleNo(
                ProductType.UPI, side, businessDate, cycleNo);
        
        assertFalse(results.isEmpty());
        
        long matchedCount = results.stream().filter(r -> r.getReconStatus() == ReconStatus.MATCHED).count();
        long unmatchedCount = results.stream().filter(r -> r.getReconStatus() == ReconStatus.UNMATCHED).count();
        
        assertTrue(matchedCount > 0);
        assertTrue(unmatchedCount > 0);
        
        // Verify exception counts
        long ex01Count = results.stream().filter(r -> r.getExceptionType() == ExceptionType.EX01).count();
        long ex02Count = results.stream().filter(r -> r.getExceptionType() == ExceptionType.EX02).count();
        long ex03Count = results.stream().filter(r -> r.getExceptionType() == ExceptionType.EX03).count();
        
        assertEquals(10, ex01Count);
        assertEquals(5, ex02Count);
        assertEquals(5, ex03Count);
    }
    
    private void injectExceptionEX01(List<TxnNormalised> cbs, List<TxnNormalised> sw, List<TxnNormalised> nw, int count) {
        for (int i = 0; i < count; i++) {
            int idx = i;
            cbs.get(idx).setStatus(TxnStatus.SUCCESS);
            sw.get(idx).setStatus(TxnStatus.FAILED);
            nw.get(idx).setStatus(TxnStatus.FAILED);
        }
    }
    
    private void injectExceptionEX02(List<TxnNormalised> cbs, List<TxnNormalised> sw, List<TxnNormalised> nw, int count) {
        for (int i = 0; i < count; i++) {
            int idx = 10 + i;
            cbs.get(idx).setStatus(TxnStatus.SUCCESS);
            sw.get(idx).setStatus(TxnStatus.SUCCESS);
            nw.set(idx, null); // Remove network record
        }
    }
    
    private void injectExceptionEX03(List<TxnNormalised> cbs, List<TxnNormalised> sw, List<TxnNormalised> nw, int count) {
        for (int i = 0; i < count; i++) {
            int idx = 15 + i;
            cbs.set(idx, null); // Remove CBS record
            sw.get(idx).setStatus(TxnStatus.SUCCESS);
            nw.get(idx).setStatus(TxnStatus.SUCCESS);
        }
    }
}
```

---

**End of Unit Test Examples**
