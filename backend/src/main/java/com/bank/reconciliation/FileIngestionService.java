package com.bank.reconciliation;

import com.bank.reconciliation.model.FileRegister;
import com.bank.reconciliation.model.FileConfig;
import com.bank.reconciliation.repository.FileRegisterRepository;
import com.bank.reconciliation.repository.FileConfigRepository;
import com.bank.reconciliation.service.SftpPoller;
import com.bank.reconciliation.service.FileValidator;
import com.bank.reconciliation.service.FileStorageService;
import com.bank.reconciliation.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * File Ingestion Service
 * 
 * Detects, validates, registers, and stages incoming files from multiple sources.
 * Supports SFTP polling and manual file upload.
 * 
 * Key Functions:
 * - SFTP directory polling per product and source
 * - File validation (name pattern, checksum, header/trailer, encoding)
 * - Duplicate detection (SHA-256 + filename + business date)
 * - File registration in file_register table
 * - Raw file storage (immutable)
 * - Archive and retention management
 * - Missing file alerts based on expected-file calendar
 */
@Service
@Slf4j
public class FileIngestionService {

    @Autowired
    private FileRegisterRepository fileRegisterRepository;

    @Autowired
    private FileConfigRepository fileConfigRepository;

    @Autowired
    private SftpPoller sftpPoller;

    @Autowired
    private FileValidator fileValidator;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Scheduled job to poll SFTP directories for new files
     * Runs every 5 minutes (configurable)
     */
    @Scheduled(fixedRate = 300000)
    public void pollSftpDirectories() {
        log.info("Starting SFTP directory polling at {}", LocalDateTime.now());
        
        try {
            // Get all active file configurations
            List<FileConfig> activeConfigs = fileConfigRepository.findByIsActiveTrue();
            
            for (FileConfig config : activeConfigs) {
                // Poll SFTP directory for this product and source
                List<File> newFiles = sftpPoller.pollDirectory(
                    config.getProduct(),
                    config.getSource(),
                    config.getFileNamePattern()
                );
                
                log.info("Found {} new files for product {} source {}", 
                    newFiles.size(), config.getProduct(), config.getSource());
                
                // Process each new file
                for (File file : newFiles) {
                    processFile(file, config);
                }
            }
            
            // Check for missing expected files
            checkMissingFiles();
            
        } catch (Exception e) {
            log.error("Error during SFTP polling", e);
        }
        
        log.info("Completed SFTP directory polling at {}", LocalDateTime.now());
    }

    /**
     * Process a single file through the ingestion pipeline
     */
    public FileRegister processFile(File file, FileConfig config) {
        log.info("Processing file: {}", file.getName());
        
        try {
            // Step 1: Validate file name pattern
            if (!fileValidator.validateFileName(file.getName(), config.getFileNamePattern())) {
                log.warn("File name pattern validation failed: {}", file.getName());
                return null;
            }
            
            // Step 2: Calculate SHA-256 checksum
            String checksum = fileValidator.calculateChecksum(file);
            
            // Step 3: Extract business date from filename
            LocalDate businessDate = fileValidator.extractBusinessDate(file.getName(), config.getFileNamePattern());
            
            // Step 4: Check for duplicate (checksum + filename + business date)
            if (fileRegisterRepository.existsByChecksumAndFileNameAndBusinessDate(
                checksum, file.getName(), businessDate)) {
                log.warn("Duplicate file detected: {}", file.getName());
                return null;
            }
            
            // Step 5: Validate header/trailer record count (if applicable)
            Map<String, Object> validationResults = fileValidator.validateFileStructure(file, config);
            if (!(Boolean) validationResults.get("valid")) {
                log.warn("File structure validation failed: {}", file.getName());
                return null;
            }
            
            // Step 6: Store raw file in object storage
            String storagePath = fileStorageService.storeRawFile(file, config.getProduct(), config.getSource());
            
            // Step 7: Register file in database
            FileRegister fileRegister = new FileRegister();
            fileRegister.setFileId(UUID.randomUUID());
            fileRegister.setProduct(config.getProduct());
            fileRegister.setSource(config.getSource());
            fileRegister.setBusinessDate(businessDate);
            fileRegister.setFileName(file.getName());
            fileRegister.setFilePath(storagePath);
            fileRegister.setFileSize(file.length());
            fileRegister.setFileChecksum(checksum);
            fileRegister.setRecordCount((Integer) validationResults.get("recordCount"));
            fileRegister.setHeaderRecord((String) validationResults.get("headerRecord"));
            fileRegister.setTrailerRecord((String) validationResults.get("trailerRecord"));
            fileRegister.setFileStatus(FileStatus.RECEIVED);
            fileRegister.setReceivedAt(LocalDateTime.now());
            
            fileRegister = fileRegisterRepository.save(fileRegister);
            
            log.info("File registered successfully: {} with ID {}", file.getName(), fileRegister.getFileId());
            
            // Step 8: Trigger parsing and normalisation
            triggerParsing(fileRegister, config);
            
            return fileRegister;
            
        } catch (Exception e) {
            log.error("Error processing file: {}", file.getName(), e);
            return null;
        }
    }

    /**
     * Manual file upload (through UI)
     */
    public FileRegister uploadFileManually(File file, String product, String source) {
        log.info("Manual file upload: {} for product {} source {}", file.getName(), product, source);
        
        // Get file configuration
        FileConfig config = fileConfigRepository.findByProductAndSourceAndIsActiveTrue(
            product, source)
            .orElseThrow(() -> new IllegalArgumentException("No active configuration found"));
        
        return processFile(file, config);
    }

    /**
     * Trigger parsing and normalisation for a registered file
     */
    private void triggerParsing(FileRegister fileRegister, FileConfig config) {
        // Send message to queue for async processing
        // Implementation depends on message queue (Kafka/RabbitMQ)
        log.info("Triggering parsing for file ID: {}", fileRegister.getFileId());
        
        // TODO: Send to message queue
        // messageQueue.send(new ParsingMessage(fileRegister.getFileId(), config.getId()));
    }

    /**
     * Check for missing expected files based on expected-file calendar
     */
    private void checkMissingFiles() {
        LocalDate today = LocalDate.now();
        
        // Get all expected file configurations for today
        List<ExpectedFileCalendar> expectedFiles = expectedFileCalendarRepository
            .findByActiveDaysContainingAndIsActiveTrue(today.getDayOfWeek().getValue());
        
        for (ExpectedFileCalendar expected : expectedFiles) {
            // Check if file has been received
            boolean fileReceived = fileRegisterRepository.existsByProductAndSourceAndBusinessDateAndCycleNo(
                expected.getProduct(),
                expected.getSource(),
                today,
                expected.getCycleNo()
            );
            
            if (!fileReceived) {
                // Check if alert threshold has passed
                LocalDateTime expectedByTime = LocalDateTime.of(today, expected.getExpectedByTime());
                LocalDateTime alertThreshold = expectedByTime.plusMinutes(expected.getAlertAfterMinutes());
                
                if (LocalDateTime.now().isAfter(alertThreshold)) {
                    log.warn("Missing expected file: product {} source {} cycle {}", 
                        expected.getProduct(), expected.getSource(), expected.getCycleNo());
                    
                    // Send alert notification
                    notificationService.sendMissingFileAlert(expected);
                }
            }
        }
    }

    /**
     * Archive old files based on retention policy
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void archiveOldFiles() {
        log.info("Starting file archival at {}", LocalDateTime.now());
        
        // Get files older than retention period (e.g., 90 days)
        LocalDate retentionDate = LocalDate.now().minusDays(90);
        List<FileRegister> filesToArchive = fileRegisterRepository
            .findByBusinessDateBeforeAndFileStatus(retentionDate, FileStatus.PROCESSED);
        
        for (FileRegister file : filesToArchive) {
            try {
                // Move to archive storage
                String archivePath = fileStorageService.archiveFile(file.getFilePath());
                
                // Update file register
                file.setArchivePath(archivePath);
                file.setFileStatus(FileStatus.ARCHIVED);
                file.setArchivedAt(LocalDateTime.now());
                fileRegisterRepository.save(file);
                
                log.info("Archived file: {} to {}", file.getFileName(), archivePath);
                
            } catch (Exception e) {
                log.error("Error archiving file: {}", file.getFileName(), e);
            }
        }
        
        log.info("Completed file archival. Processed {} files", filesToArchive.size());
    }
}
