package com.bank.reconciliation.ttum;

import com.bank.reconciliation.model.TtumBatch;
import com.bank.reconciliation.model.TtumEntry;
import com.bank.reconciliation.model.ExceptionHistory;
import com.bank.reconciliation.model.TtumRuleConfig;
import com.bank.reconciliation.model.GlMapping;
import com.bank.reconciliation.repository.TtumBatchRepository;
import com.bank.reconciliation.repository.TtumEntryRepository;
import com.bank.reconciliation.repository.ExceptionHistoryRepository;
import com.bank.reconciliation.repository.TtumRuleConfigRepository;
import com.bank.reconciliation.repository.GlMappingRepository;
import com.bank.reconciliation.enums.ProductType;
import com.bank.reconciliation.enums.TransactionSide;
import com.bank.reconciliation.enums.ExceptionType;
import com.bank.reconciliation.enums.TtumStatus;
import com.bank.reconciliation.enums.DrCrFlag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * TTUM Generator
 * 
 * Generates Dr/Cr entries for unmatched transactions with maker-checker workflow.
 * 
 * Key Functions:
 * - Rule-driven TTUM generation (product × exception_type × side)
 * - Idempotency check (same RRN + type already has TTUM?)
 * - Account validation (status check via CBS API or master file)
 * - GL mapping lookup
 * - TTUM batch creation with control checks
 * - Maker-checker workflow (mandatory separation)
 * - CBS-format export (configurable per CBS)
 * - CBS upload (manual or API)
 * - CBS feedback processing
 * - Re-generation support (versioned history)
 */
@Service
@Slf4j
public class TTUMGenerator {

    @Autowired
    private TtumBatchRepository ttumBatchRepository;

    @Autowired
    private TtumEntryRepository ttumEntryRepository;

    @Autowired
    private ExceptionHistoryRepository exceptionHistoryRepository;

    @Autowired
    private TtumRuleConfigRepository ttumRuleConfigRepository;

    @Autowired
    private GlMappingRepository glMappingRepository;

    @Autowired
    private AccountValidationService accountValidationService;

    @Autowired
    private CbsExportService cbsExportService;

    @Autowired
    private CbsUploadService cbsUploadService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");

    /**
     * Generate TTUM for a single exception
     */
    @Transactional
    public TtumBatch generateTTUMForException(UUID exceptionId, String maker) {
        log.info("Generating TTUM for exception ID: {} by maker: {}", exceptionId, maker);
        
        try {
            // Get exception
            ExceptionHistory exception = exceptionHistoryRepository.findById(exceptionId)
                .orElseThrow(() -> new IllegalArgumentException("Exception not found"));
            
            // Check idempotency (same RRN + type already has TTUM?)
            if (ttumEntryRepository.existsByRrnAndExceptionTypeAndStatusNotIn(
                exception.getRrn(), exception.getExceptionType(), 
                List.of(TtumStatus.FAILED, TtumStatus.DRAFT))) {
                log.warn("TTUM already exists for RRN {} and exception type {}", 
                    exception.getRrn(), exception.getExceptionType());
                return null;
            }
            
            // Get TTUM rule
            TtumRuleConfig rule = ttumRuleConfigRepository
                .findByProductAndSideAndExceptionTypeAndIsActiveTrue(
                    exception.getProduct(), exception.getSide(), exception.getExceptionType())
                .orElseThrow(() -> new IllegalArgumentException("No TTUM rule found"));
            
            // Get GL mapping
            GlMapping drGl = glMappingRepository.findByProductAndGlCodeAndIsActiveTrue(
                exception.getProduct(), rule.getDrGlAccount())
                .orElseThrow(() -> new IllegalArgumentException("DR GL not found"));
            
            GlMapping crGl = glMappingRepository.findByProductAndGlCodeAndIsActiveTrue(
                exception.getProduct(), rule.getCrGlAccount())
                .orElseThrow(() -> new IllegalArgumentException("CR GL not found"));
            
            // Validate account
            String accountNo = getAccountNumber(exception);
            AccountStatus accountStatus = accountValidationService.validateAccount(accountNo);
            
            // Use suspense GL if account is frozen/closed/invalid
            String finalDrGl = drGl.getAccountNo();
            String finalCrGl = crGl.getAccountNo();
            
            if (accountStatus != AccountStatus.ACTIVE && rule.getSuspenseGlAccount() != null) {
                GlMapping suspenseGl = glMappingRepository.findByProductAndGlCodeAndIsActiveTrue(
                    exception.getProduct(), rule.getSuspenseGlAccount())
                    .orElse(null);
                
                if (suspenseGl != null) {
                    finalCrGl = suspenseGl.getAccountNo();
                    log.info("Using suspense GL {} for inactive account", suspenseGl.getGlCode());
                }
            }
            
            // Calculate value date
            LocalDate valueDate = exception.getBusinessDate().plusDays(rule.getValueDateOffsetDays());
            
            // Build narration
            String narration = buildNarration(rule.getNarrationTemplate(), exception);
            
            // Calculate amount
            BigDecimal amount = calculateAmount(rule, exception);
            
            // Create TTUM batch (single entry batch)
            TtumBatch batch = new TtumBatch();
            batch.setBatchId(UUID.randomUUID());
            batch.setProduct(exception.getProduct());
            batch.setBusinessDate(exception.getBusinessDate());
            batch.setBatchName(String.format("TTUM_%s_%s", exception.getExceptionType(), exception.getRrn()));
            batch.setStatus(TtumStatus.DRAFT);
            batch.setRecordCount(1);
            batch.setDrTotal(amount);
            batch.setCrTotal(amount);
            batch.setMaker(maker);
            batch.setMakerAt(LocalDateTime.now());
            
            batch = ttumBatchRepository.save(batch);
            
            // Create TTUM entry
            TtumEntry entry = new TtumEntry();
            entry.setBatchId(batch.getBatchId());
            entry.setEntryId(UUID.randomUUID());
            entry.setRrn(exception.getRrn());
            entry.setTxnId(exception.getTxnId());
            entry.setExceptionId(exception.getExceptionId());
            entry.setAccountNo(accountNo);
            entry.setGlAccount(DrCrFlag.DR.equals(rule.getDrGlAccount()) ? finalDrGl : finalCrGl);
            entry.setBranchCode(exception.getBranchCode());
            entry.setDrCrFlag(DrCrFlag.DR);
            entry.setAmount(amount);
            entry.setValueDate(valueDate);
            entry.setParticulars(narration);
            entry.setProductCode(exception.getProduct().name());
            entry.setStatus(TtumStatus.DRAFT);
            
            ttumEntryRepository.save(entry);
            
            // Create CR entry
            TtumEntry crEntry = new TtumEntry();
            crEntry.setBatchId(batch.getBatchId());
            crEntry.setEntryId(UUID.randomUUID());
            crEntry.setRrn(exception.getRrn());
            crEntry.setTxnId(exception.getTxnId());
            crEntry.setExceptionId(exception.getExceptionId());
            crEntry.setAccountNo(accountNo);
            crEntry.setGlAccount(DrCrFlag.CR.equals(rule.getCrGlAccount()) ? finalCrGl : finalDrGl);
            crEntry.setBranchCode(exception.getBranchCode());
            crEntry.setDrCrFlag(DrCrFlag.CR);
            crEntry.setAmount(amount);
            crEntry.setValueDate(valueDate);
            crEntry.setParticulars(narration);
            crEntry.setProductCode(exception.getProduct().name());
            crEntry.setStatus(TtumStatus.DRAFT);
            
            ttumEntryRepository.save(crEntry);
            
            // Update exception status
            exception.setStatus(ExceptionWorkflowStatus.TTUM_GENERATED);
            exception.setTtumBatchId(batch.getId());
            exceptionHistoryRepository.save(exception);
            
            log.info("TTUM generated successfully for exception ID: {}", exceptionId);
            
            return batch;
            
        } catch (Exception e) {
            log.error("Error generating TTUM for exception ID: {}", exceptionId, e);
            throw new RuntimeException("TTUM generation failed", e);
        }
    }

    /**
     * Generate TTUM for multiple exceptions (bulk generation)
     */
    @Transactional
    public TtumBatch generateBulkTTUM(List<UUID> exceptionIds, String maker) {
        log.info("Generating bulk TTUM for {} exceptions by maker: {}", exceptionIds.size(), maker);
        
        List<TtumEntry> entries = new ArrayList<>();
        BigDecimal totalDr = BigDecimal.ZERO;
        BigDecimal totalCr = BigDecimal.ZERO;
        
        for (UUID exceptionId : exceptionIds) {
            try {
                // Generate TTUM for each exception (without creating batch)
                TtumEntry entry = generateTTUMEntry(exceptionId, maker);
                if (entry != null) {
                    entries.add(entry);
                    
                    if (entry.getDrCrFlag() == DrCrFlag.DR) {
                        totalDr = totalDr.add(entry.getAmount());
                    } else {
                        totalCr = totalCr.add(entry.getAmount());
                    }
                }
            } catch (Exception e) {
                log.error("Error generating TTUM for exception ID: {}", exceptionId, e);
            }
        }
        
        if (entries.isEmpty()) {
            log.warn("No TTUM entries generated");
            return null;
        }
        
        // Create batch
        TtumBatch batch = new TtumBatch();
        batch.setBatchId(UUID.randomUUID());
        batch.setProduct(entries.get(0).getProductCode() != null ? 
            ProductType.valueOf(entries.get(0).getProductCode()) : ProductType.UPI);
        batch.setBusinessDate(LocalDate.now());
        batch.setBatchName(String.format("BULK_TTUM_%s", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))));
        batch.setStatus(TtumStatus.DRAFT);
        batch.setRecordCount(entries.size());
        batch.setDrTotal(totalDr);
        batch.setCrTotal(totalCr);
        batch.setMaker(maker);
        batch.setMakerAt(LocalDateTime.now());
        
        batch = ttumBatchRepository.save(batch);
        
        // Update entries with batch ID
        for (TtumEntry entry : entries) {
            entry.setBatchId(batch.getBatchId());
        }
        
        ttumEntryRepository.saveAll(entries);
        
        log.info("Bulk TTUM generated successfully with {} entries", entries.size());
        
        return batch;
    }

    /**
     * Submit TTUM batch for approval (maker action)
     */
    @Transactional
    public void submitForApproval(UUID batchId, String maker) {
        log.info("Submitting TTUM batch {} for approval by maker: {}", batchId, maker);
        
        TtumBatch batch = ttumBatchRepository.findByBatchId(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        
        // Control check: Dr total must equal Cr total
        if (batch.getDrTotal().compareTo(batch.getCrTotal()) != 0) {
            throw new IllegalStateException("Dr total must equal Cr total");
        }
        
        // Check record count
        long actualCount = ttumEntryRepository.countByBatchId(batchId);
        if (actualCount != batch.getRecordCount()) {
            throw new IllegalStateException("Record count mismatch");
        }
        
        // Update status
        batch.setStatus(TtumStatus.SUBMITTED);
        batch.setMaker(maker);
        batch.setMakerAt(LocalDateTime.now());
        
        ttumBatchRepository.save(batch);
        
        log.info("TTUM batch {} submitted for approval", batchId);
    }

    /**
     * Approve TTUM batch (checker action)
     */
    @Transactional
    public void approveBatch(UUID batchId, String checker) {
        log.info("Approving TTUM batch {} by checker: {}", batchId, checker);
        
        TtumBatch batch = ttumBatchRepository.findByBatchId(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        
        // Maker-checker validation: same user cannot make and check
        if (batch.getMaker() != null && batch.getMaker().equals(checker)) {
            throw new IllegalStateException("Same user cannot make and check");
        }
        
        // Update status
        batch.setStatus(TtumStatus.APPROVED);
        batch.setChecker(checker);
        batch.setCheckerAt(LocalDateTime.now());
        
        ttumBatchRepository.save(batch);
        
        // Generate CBS export file
        generateCBSExport(batch);
        
        log.info("TTUM batch {} approved", batchId);
    }

    /**
     * Generate CBS export file
     */
    private void generateCBSExport(TtumBatch batch) {
        log.info("Generating CBS export for batch: {}", batch.getBatchId());
        
        try {
            // Get all entries for this batch
            List<TtumEntry> entries = ttumEntryRepository.findByBatchId(batch.getBatchId());
            
            // Generate CBS format file
            String exportFilePath = cbsExportService.generateExportFile(batch, entries);
            
            // Update batch
            batch.setExportFilePath(exportFilePath);
            batch.setStatus(TtumStatus.GENERATED);
            batch.setGeneratedAt(LocalDateTime.now());
            
            ttumBatchRepository.save(batch);
            
            log.info("CBS export generated: {}", exportFilePath);
            
        } catch (Exception e) {
            log.error("Error generating CBS export for batch: {}", batch.getBatchId(), e);
            batch.setStatus(TtumStatus.FAILED);
            ttumBatchRepository.save(batch);
        }
    }

    /**
     * Upload TTUM to CBS
     */
    @Transactional
    public void uploadToCBS(UUID batchId) {
        log.info("Uploading TTUM batch {} to CBS", batchId);
        
        TtumBatch batch = ttumBatchRepository.findByBatchId(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        
        if (batch.getStatus() != TtumStatus.GENERATED) {
            throw new IllegalStateException("Batch must be in GENERATED status");
        }
        
        try {
            // Upload to CBS
            CbsUploadResult result = cbsUploadService.uploadFile(batch.getExportFilePath());
            
            // Update batch
            batch.setStatus(TtumStatus.UPLOADED);
            batch.setUploadedAt(LocalDateTime.now());
            batch.setUploadStatus(result.getStatus());
            batch.setUploadResponse(result.getResponse());
            
            ttumBatchRepository.save(batch);
            
            log.info("TTUM batch {} uploaded to CBS", batchId);
            
        } catch (Exception e) {
            log.error("Error uploading TTUM batch {} to CBS", batchId, e);
            batch.setStatus(TtumStatus.FAILED);
            ttumBatchRepository.save(batch);
        }
    }

    /**
     * Process CBS feedback
     */
    @Transactional
    public void processCBSFeedback(UUID fileRegisterId) {
        log.info("Processing CBS feedback for file: {}", fileRegisterId);
        
        // Parse CBS feedback file
        List<CbsFeedbackRecord> feedbackRecords = cbsUploadService.parseFeedbackFile(fileRegisterId);
        
        for (CbsFeedbackRecord feedback : feedbackRecords) {
            // Find corresponding TTUM entry
            TtumEntry entry = ttumEntryRepository.findByEntryId(feedback.getEntryId()).orElse(null);
            
            if (entry != null) {
                // Update entry status
                entry.setStatus("SUCCESS".equals(feedback.getStatus()) ? TtumStatus.POSTED : TtumStatus.FAILED);
                entry.setCbsStatus(feedback.getStatus());
                entry.setCbsResponseText(feedback.getResponseText());
                
                ttumEntryRepository.save(entry);
                
                // Update exception status if posted
                if (entry.getStatus() == TtumStatus.POSTED) {
                    ExceptionHistory exception = exceptionHistoryRepository.findById(entry.getExceptionId()).orElse(null);
                    if (exception != null) {
                        exception.setStatus(ExceptionWorkflowStatus.POSTED);
                        exceptionHistoryRepository.save(exception);
                    }
                }
            }
        }
        
        log.info("Processed {} CBS feedback records", feedbackRecords.size());
    }

    /**
     * Generate TTUM entry (helper method for bulk generation)
     */
    private TtumEntry generateTTUMEntry(UUID exceptionId, String maker) {
        // Similar logic to generateTTUMForException, but returns entry only
        // ...
        return null;
    }

    /**
     * Get account number from exception
     */
    private String getAccountNumber(ExceptionHistory exception) {
        // Get account number from transaction
        // ...
        return "1234567890"; // Placeholder
    }

    /**
     * Build narration
     */
    private String buildNarration(String template, ExceptionHistory exception) {
        return template
            .replace("{PRODUCT}", exception.getProduct().name())
            .replace("{rrn}", exception.getRrn())
            .replace("{ddmmyyyy}", exception.getBusinessDate().format(DATE_FORMATTER));
    }

    /**
     * Calculate amount
     */
    private BigDecimal calculateAmount(TtumRuleConfig rule, ExceptionHistory exception) {
        if ("TXN_AMOUNT".equals(rule.getAmountSource())) {
            return exception.getAmount();
        } else if ("FEE_AMOUNT".equals(rule.getAmountSource())) {
            return exception.getFeeAmount() != null ? exception.getFeeAmount() : BigDecimal.ZERO;
        } else if ("CALCULATED".equals(rule.getAmountSource())) {
            // Calculate based on conditions (e.g., compensation)
            return calculateCompensation(rule, exception);
        }
        return exception.getAmount();
    }

    /**
     * Calculate compensation
     */
    private BigDecimal calculateCompensation(TtumRuleConfig rule, ExceptionHistory exception) {
        // Calculate compensation based on rule conditions
        // e.g., compensation_per_day * days_late, capped at max_compensation
        // ...
        return BigDecimal.ZERO;
    }
}
