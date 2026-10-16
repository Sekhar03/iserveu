package com.bank.reconciliation.gl;

import com.bank.reconciliation.model.GlBalanceDaily;
import com.bank.reconciliation.model.GlDifference;
import com.bank.reconciliation.model.GlMapping;
import com.bank.reconciliation.model.ReconSummary;
import com.bank.reconciliation.model.TtumBatch;
import com.bank.reconciliation.repository.GlBalanceDailyRepository;
import com.bank.reconciliation.repository.GlDifferenceRepository;
import com.bank.reconciliation.repository.GlMappingRepository;
import com.bank.reconciliation.repository.ReconSummaryRepository;
import com.bank.reconciliation.repository.TtumBatchRepository;
import com.bank.reconciliation.enums.ProductType;
import com.bank.reconciliation.enums.TtumStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * GL Balancing Engine
 * 
 * Verifies GL balances and explains differences between expected and actual balances.
 * 
 * Key Functions:
 * - Daily GL balance calculation
 * - Opening balance + matched + TTUM + suspense = expected closing
 * - Difference analysis (expected vs actual from CBS)
 * - Auto-tagged difference reasons
 * - Product-wise and GL-wise reporting
 * - Settlement verification (NPCI vs bank settlement account)
 * - Day close with approval workflow
 * - Historical trend analysis
 */
@Service
@Slf4j
public class GLEngine {

    @Autowired
    private GlBalanceDailyRepository glBalanceDailyRepository;

    @Autowired
    private GlDifferenceRepository glDifferenceRepository;

    @Autowired
    private GlMappingRepository glMappingRepository;

    @Autowired
    private ReconSummaryRepository reconSummaryRepository;

    @Autowired
    private TtumBatchRepository ttumBatchRepository;

    @Autowired
    private CbsGlService cbsGlService;

    @Autowired
    private SettlementVerificationService settlementVerificationService;

    /**
     * Calculate GL balance for a product and date
     */
    @Transactional
    public void calculateGLBalance(ProductType product, LocalDate businessDate) {
        log.info("Calculating GL balance for product: {}, date: {}", product, businessDate);
        
        try {
            // Get all GL mappings for this product
            List<GlMapping> glMappings = glMappingRepository.findByProductAndIsActiveTrue(product);
            
            for (GlMapping glMapping : glMappings) {
                calculateGLBalanceForGL(glMapping, businessDate);
            }
            
            log.info("GL balance calculation completed for product: {}, date: {}", product, businessDate);
            
        } catch (Exception e) {
            log.error("Error calculating GL balance for product: {}, date: {}", product, businessDate, e);
        }
    }

    /**
     * Calculate GL balance for a specific GL account
     */
    private void calculateGLBalanceForGL(GlMapping glMapping, LocalDate businessDate) {
        log.info("Calculating GL balance for GL: {} on date: {}", glMapping.getGlCode(), businessDate);
        
        try {
            // Get opening balance (previous day's closing balance)
            GlBalanceDaily previousBalance = glBalanceDailyRepository
                .findByGlAccountAndBusinessDate(glMapping.getAccountNo(), businessDate.minusDays(1))
                .orElse(null);
            
            BigDecimal openingBalance = previousBalance != null ? previousBalance.getClosingBalance() : BigDecimal.ZERO;
            
            // Get matched amount from recon summary
            List<ReconSummary> summaries = reconSummaryRepository
                .findByProductAndBusinessDate(glMapping.getProduct(), businessDate);
            
            BigDecimal matchedAmount = summaries.stream()
                .map(ReconSummary::getMatchedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Get TTUM posted amount
            BigDecimal ttumPostedAmount = ttumBatchRepository
                .sumAmountByProductAndBusinessDateAndStatus(
                    glMapping.getProduct(), businessDate, TtumStatus.POSTED);
            
            // Get TTUM pending amount
            BigDecimal ttumPendingAmount = ttumBatchRepository
                .sumAmountByProductAndBusinessDateAndStatus(
                    glMapping.getProduct(), businessDate, TtumStatus.APPROVED);
            
            // Get suspense amount (unmatched exceptions)
            BigDecimal suspenseAmount = calculateSuspenseAmount(glMapping.getProduct(), businessDate);
            
            // Calculate expected closing balance
            BigDecimal expectedClosing = openingBalance
                .add(matchedAmount)
                .add(ttumPostedAmount)
                .add(ttumPendingAmount)
                .add(suspenseAmount);
            
            // Get actual closing balance from CBS
            BigDecimal actualClosing = cbsGlService.getGLBalance(
                glMapping.getAccountNo(), businessDate, glMapping.getBranchCode());
            
            // Calculate difference
            BigDecimal difference = expectedClosing.subtract(actualClosing);
            
            // Create GL balance record
            GlBalanceDaily glBalance = new GlBalanceDaily();
            glBalance.setProduct(glMapping.getProduct());
            glBalance.setGlAccount(glMapping.getAccountNo());
            glBalance.setGlType(glMapping.getGlType());
            glBalance.setBusinessDate(businessDate);
            glBalance.setBranchCode(glMapping.getBranchCode());
            glBalance.setOpeningBalance(openingBalance);
            glBalance.setDrAmount(matchedAmount.add(ttumPostedAmount));
            glBalance.setCrAmount(BigDecimal.ZERO); // Calculate based on GL type
            glBalance.setClosingBalance(actualClosing);
            glBalance.setExpectedClosingBalance(expectedClosing);
            glBalance.setDifferenceAmount(difference);
            glBalance.setMatchedAmount(matchedAmount);
            glBalance.setTtumPostedAmount(ttumPostedAmount);
            glBalance.setTtumPendingAmount(ttumPendingAmount);
            glBalance.setSuspenseAmount(suspenseAmount);
            glBalance.setStatus("PENDING");
            glBalance.setCreatedAt(LocalDateTime.now());
            glBalance.setUpdatedAt(LocalDateTime.now());
            
            glBalanceDailyRepository.save(glBalance);
            
            // If difference exists, create difference record
            if (difference.compareTo(BigDecimal.ZERO) != 0) {
                analyzeDifference(glBalance, glMapping);
            }
            
            log.info("GL balance calculated for GL: {} on date: {}. Difference: {}", 
                glMapping.getGlCode(), businessDate, difference);
            
        } catch (Exception e) {
            log.error("Error calculating GL balance for GL: {} on date: {}", 
                glMapping.getGlCode(), businessDate, e);
        }
    }

    /**
     * Calculate suspense amount from unmatched exceptions
     */
    private BigDecimal calculateSuspenseAmount(ProductType product, LocalDate businessDate) {
        // Sum amount of open exceptions for this product and date
        // ...
        return BigDecimal.ZERO;
    }

    /**
     * Analyze GL difference and create difference record
     */
    private void analyzeDifference(GlBalanceDaily glBalance, GlMapping glMapping) {
        log.info("Analyzing GL difference for GL: {} on date: {}", glMapping.getGlCode(), glBalance.getBusinessDate());
        
        GlDifference difference = new GlDifference();
        difference.setProduct(glMapping.getProduct());
        difference.setGlAccount(glMapping.getGlAccount());
        difference.setBusinessDate(glBalance.getBusinessDate());
        difference.setDifferenceAmount(glBalance.getDifferenceAmount());
        
        // Auto-tag reason
        String reasonCode = autoTagReason(glBalance);
        difference.setReasonCode(reasonCode);
        difference.setReasonDescription(getReasonDescription(reasonCode));
        
        // Breakdown difference
        difference.setTtumPendingAmount(glBalance.getTtumPendingAmount());
        difference.setTtumFailedAmount(calculateTTUMFailedAmount(glMapping.getProduct(), glBalance.getBusinessDate()));
        difference.setTimingDifferenceAmount(calculateTimingDifference(glBalance));
        difference.setManualCbsEntryAmount(calculateManualCbsEntryAmount(glBalance));
        difference.setWrongMappingAmount(BigDecimal.ZERO); // Manual review needed
        difference.setFeesBookedSeparatelyAmount(calculateFeesBookedSeparately(glBalance));
        
        // Calculate unexplained amount
        BigDecimal explainedSum = difference.getTtumPendingAmount()
            .add(difference.getTtumFailedAmount())
            .add(difference.getTimingDifferenceAmount())
            .add(difference.getManualCbsEntryAmount())
            .add(difference.getWrongMappingAmount())
            .add(difference.getFeesBookedSeparatelyAmount());
        
        difference.setUnexplainedAmount(difference.getDifferenceAmount().subtract(explainedSum));
        
        // Get unmatched count and amount
        difference.setUnmatchedCount(calculateUnmatchedCount(glMapping.getProduct(), glBalance.getBusinessDate()));
        difference.setUnmatchedAmount(calculateUnmatchedAmount(glMapping.getProduct(), glBalance.getBusinessDate()));
        
        difference.setCreatedAt(LocalDateTime.now());
        difference.setUpdatedAt(LocalDateTime.now());
        
        glDifferenceRepository.save(difference);
        
        log.info("GL difference analyzed for GL: {}. Reason: {}, Unexplained: {}", 
            glMapping.getGlCode(), reasonCode, difference.getUnexplainedAmount());
    }

    /**
     * Auto-tag reason for GL difference
     */
    private String autoTagReason(GlBalanceDaily glBalance) {
        BigDecimal difference = glBalance.getDifferenceAmount();
        BigDecimal ttumPending = glBalance.getTtumPendingAmount();
        
        // If TTUM pending amount matches difference
        if (difference.compareTo(ttumPending.abs()) == 0) {
            return "TTUM_PENDING";
        }
        
        // If difference is small, might be timing
        if (difference.abs().compareTo(new BigDecimal("100")) < 0) {
            return "TIMING_DIFFERENCE";
        }
        
        // Default
        return "UNEXPLAINED";
    }

    /**
     * Get reason description
     */
    private String getReasonDescription(String reasonCode) {
        switch (reasonCode) {
            case "TTUM_PENDING":
                return "TTUM pending approval or upload";
            case "TTUM_FAILED":
                return "TTUM failed to post in CBS";
            case "TIMING_DIFFERENCE":
                return "Timing difference between systems";
            case "MANUAL_CBS_ENTRY":
                return "Manual entry in CBS not captured in recon";
            case "WRONG_MAPPING":
                return "Wrong GL mapping configuration";
            case "FEES_BOOKED_SEPARATELY":
                return "Fees booked separately in CBS";
            case "UNEXPLAINED":
                return "Unexplained difference - requires investigation";
            default:
                return "Unknown reason";
        }
    }

    /**
     * Calculate TTUM failed amount
     */
    private BigDecimal calculateTTUMFailedAmount(ProductType product, LocalDate businessDate) {
        return ttumBatchRepository
            .sumAmountByProductAndBusinessDateAndStatus(product, businessDate, TtumStatus.FAILED);
    }

    /**
     * Calculate timing difference
     */
    private BigDecimal calculateTimingDifference(GlBalanceDaily glBalance) {
        // Check if difference is due to cross-midnight transactions
        // ...
        return BigDecimal.ZERO;
    }

    /**
     * Calculate manual CBS entry amount
     */
    private BigDecimal calculateManualCbsEntryAmount(GlBalanceDaily glBalance) {
        // Identify manual entries in CBS not captured in recon
        // ...
        return BigDecimal.ZERO;
    }

    /**
     * Calculate fees booked separately
     */
    private BigDecimal calculateFeesBookedSeparately(GlBalanceDaily glBalance) {
        // Identify fees booked separately in CBS
        // ...
        return BigDecimal.ZERO;
    }

    /**
     * Calculate unmatched count
     */
    private int calculateUnmatchedCount(ProductType product, LocalDate businessDate) {
        // Count unmatched exceptions
        // ...
        return 0;
    }

    /**
     * Calculate unmatched amount
     */
    private BigDecimal calculateUnmatchedAmount(ProductType product, LocalDate businessDate) {
        // Sum unmatched exception amounts
        // ...
        return BigDecimal.ZERO;
    }

    /**
     * Approve GL balance (day close)
     */
    @Transactional
    public void approveGLBalance(Long glBalanceId, String approver) {
        log.info("Approving GL balance ID: {} by approver: {}", glBalanceId, approver);
        
        GlBalanceDaily glBalance = glBalanceDailyRepository.findById(glBalanceId)
            .orElseThrow(() -> new IllegalArgumentException("GL balance not found"));
        
        if (glBalance.getDifferenceAmount().compareTo(BigDecimal.ZERO) != 0) {
            // Check if all differences are resolved
            List<GlDifference> unresolvedDifferences = glDifferenceRepository
                .findByProductAndBusinessDateAndIsResolvedFalse(
                    glBalance.getProduct(), glBalance.getBusinessDate());
            
            if (!unresolvedDifferences.isEmpty()) {
                throw new IllegalStateException("Cannot approve GL balance with unresolved differences");
            }
        }
        
        // Update status
        glBalance.setStatus("APPROVED");
        glBalance.setApprovedBy(approver);
        glBalance.setApprovedAt(LocalDateTime.now());
        
        glBalanceDailyRepository.save(glBalance);
        
        log.info("GL balance approved: {}", glBalanceId);
    }

    /**
     * Lock GL balance (day close)
     */
    @Transactional
    public void lockGLBalance(Long glBalanceId, String approver) {
        log.info("Locking GL balance ID: {} by approver: {}", glBalanceId, approver);
        
        GlBalanceDaily glBalance = glBalanceDailyRepository.findById(glBalanceId)
            .orElseThrow(() -> new IllegalArgumentException("GL balance not found"));
        
        if (!"APPROVED".equals(glBalance.getStatus())) {
            throw new IllegalStateException("GL balance must be approved before locking");
        }
        
        // Update status
        glBalance.setStatus("LOCKED");
        glBalance.setApprovedBy(approver);
        glBalance.setApprovedAt(LocalDateTime.now());
        
        glBalanceDailyRepository.save(glBalance);
        
        log.info("GL balance locked: {}", glBalanceId);
    }

    /**
     * Resolve GL difference
     */
    @Transactional
    public void resolveDifference(Long differenceId, String resolvedBy, String resolutionNotes) {
        log.info("Resolving GL difference ID: {} by: {}", differenceId, resolvedBy);
        
        GlDifference difference = glDifferenceRepository.findById(differenceId)
            .orElseThrow(() -> new IllegalArgumentException("Difference not found"));
        
        difference.setResolved(true);
        difference.setResolvedAt(LocalDateTime.now());
        difference.setResolvedBy(resolvedBy);
        difference.setResolutionNotes(resolutionNotes);
        
        glDifferenceRepository.save(difference);
        
        log.info("GL difference resolved: {}", differenceId);
    }

    /**
     * Verify settlement (NPCI vs bank settlement account)
     */
    @Transactional
    public void verifySettlement(ProductType product, LocalDate businessDate) {
        log.info("Verifying settlement for product: {}, date: {}", product, businessDate);
        
        try {
            // Get NPCI settlement reports for this product and date
            List<NPCISettlementReport> npciSettlements = settlementVerificationService
                .getNPCISettlementReports(product, businessDate);
            
            for (NPCISettlementReport npciSettlement : npciSettlements) {
                // Get bank settlement account movement
                BigDecimal bankSettlementAmount = cbsGlService.getSettlementAccountMovement(
                    npciSettlement.getSettlementAccount(), businessDate);
                
                // Compare
                BigDecimal difference = npciSettlement.getNetAmount().subtract(bankSettlementAmount);
                
                // Create settlement verification record
                SettlementVerification verification = new SettlementVerification();
                verification.setProduct(product);
                verification.setBusinessDate(businessDate);
                verification.setCycleNo(npciSettlement.getCycleNo());
                verification.setNpciSettlementAmount(npciSettlement.getNetAmount());
                verification.setNpciSettlementFileId(npciSettlement.getFileId());
                verification.setBankSettlementAccount(npciSettlement.getSettlementAccount());
                verification.setBankSettlementAmount(bankSettlementAmount);
                verification.setBankStatementFileId(null); // Get from CBS
                verification.setDifferenceAmount(difference);
                verification.setMatched(difference.compareTo(BigDecimal.ZERO) == 0);
                verification.setStatus(difference.compareTo(BigDecimal.ZERO) == 0 ? "VERIFIED" : "DIFFERENCE");
                verification.setCreatedAt(LocalDateTime.now());
                verification.setUpdatedAt(LocalDateTime.now());
                
                settlementVerificationRepository.save(verification);
                
                if (difference.compareTo(BigDecimal.ZERO) != 0) {
                    log.warn("Settlement difference detected for product: {}, cycle: {}, difference: {}", 
                        product, npciSettlement.getCycleNo(), difference);
                }
            }
            
            log.info("Settlement verification completed for product: {}, date: {}", product, businessDate);
            
        } catch (Exception e) {
            log.error("Error verifying settlement for product: {}, date: {}", product, businessDate, e);
        }
    }

    /**
     * Generate GL balancing report
     */
    public GLBalancingReport generateGLBalancingReport(ProductType product, LocalDate businessDate) {
        log.info("Generating GL balancing report for product: {}, date: {}", product, businessDate);
        
        GLBalancingReport report = new GLBalancingReport();
        report.setProduct(product);
        report.setBusinessDate(businessDate);
        report.setGeneratedAt(LocalDateTime.now());
        
        // Get all GL balances for this product and date
        List<GlBalanceDaily> glBalances = glBalanceDailyRepository
            .findByProductAndBusinessDate(product, businessDate);
        
        report.setGlBalances(glBalances);
        
        // Get all differences
        List<GlDifference> differences = glDifferenceRepository
            .findByProductAndBusinessDate(product, businessDate);
        
        report.setDifferences(differences);
        
        // Calculate summary
        BigDecimal totalDifference = differences.stream()
            .map(GlDifference::getDifferenceAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.setTotalDifference(totalDifference);
        report.setResolvedCount((int) differences.stream().filter(GlDifference::isResolved).count());
        report.setUnresolvedCount(differences.size() - report.getResolvedCount());
        
        return report;
    }
}
