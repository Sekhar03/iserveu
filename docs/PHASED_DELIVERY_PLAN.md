# Phased Delivery Plan with Effort Estimates
## For Both Commercial Scenarios

**Version:** 1.0  
**Date:** 2026-10-15  
**Prepared for:** Saraswat Co-operative Bank Ltd.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Commercial Scenarios](#2-commercial-scenarios)
3. [Phased Delivery Plan](#3-phased-delivery-plan)
4. [Effort Estimates](#4-effort-estimates)
5. [Resource Requirements](#5-resource-requirements)
6. [Risk Assessment](#6-risk-assessment)
7. [Success Criteria](#7-success-criteria)
8. [Recommendation](#8-recommendation)

---

## 1. Executive Summary

This document outlines the phased delivery plan for the Digital Payments Reconciliation Platform, including effort estimates for two commercial scenarios:

1. **With Manpower Support (Vendor-Managed):** Vendor operations team runs the platform
2. **Without Manpower Support (Bank-Managed):** Bank staff run the platform

The same codebase supports both scenarios; only user roles, SLAs, and dashboards differ.

**Total Project Duration:** 28-40 weeks (7-10 months)  
**Total Effort:** 250-350 person-months

---

## 2. Commercial Scenarios

### 2.1 Scenario A: With Manpower Support (Vendor-Managed)

**Description:** Vendor operations team runs the platform; bank staff only perform approvals (TTUM checker, GL approval).

**Roles:**
- **Vendor:** L1 Recon Operator, L2 Dispute Handler, L3 Admin/Config
- **Bank:** TTUM Checker/Approver, GL Approver, Auditor (read-only)

**SLAs:**
- Vendor-managed SLAs for resolution times
- Vendor provides 24x7 support
- Vendor handles all operational tasks

**Pricing Model:**
- One-time development cost
- Monthly operations fee (based on transaction volume)
- SLA-based penalties for non-compliance

**Pros:**
- Bank requires minimal operational overhead
- Vendor expertise available
- Faster issue resolution
- Scalable operations

**Cons:**
- Higher ongoing cost
- Dependency on vendor
- Less control over operations

### 2.2 Scenario B: Without Manpower Support (Bank-Managed)

**Description:** Bank staff run the platform; vendor only provides development and support.

**Roles:**
- **Bank:** L1 Recon Operator, L2 Dispute Handler, L3 Admin/Config, TTUM Maker/Checker, GL Approver, Auditor

**SLAs:**
- Bank-defined SLAs
- Bank handles operational tasks
- Vendor provides Level 3 support (only for critical issues)

**Pricing Model:**
- One-time development cost
- Lower monthly support fee (maintenance only)
- No per-transaction fee

**Pros:**
- Lower ongoing cost
- Full control over operations
- No vendor dependency
- Bank staff gain expertise

**Cons:**
- Higher operational overhead for bank
- Requires bank to train staff
- Slower issue resolution initially
- Scalability depends on bank staffing

---

## 3. Phased Delivery Plan

### 3.1 Overview

The project is divided into 8 phases:

| Phase | Duration | Key Deliverables | Dependencies |
|-------|----------|------------------|--------------|
| Phase 0: Discovery | 2-3 weeks | Requirements, gap study, design approval | - |
| Phase 1: Foundation | 3-4 weeks | Infrastructure, ingestion framework, common schema | Phase 0 |
| Phase 2: UPI & IMPS | 6-8 weeks | UPI/IMPS recon, TTUM, GL | Phase 1 |
| Phase 3: NFS, RuPay, VISA | 4-6 weeks | NFS Issuer/Acquirer, RuPay, VISA recon | Phase 2 |
| Phase 4: AEPS, BBPS, NETC, PG, Gift Card | 3-4 weeks | Remaining products | Phase 3 |
| Phase 5: Dispute Module | 6-8 weeks (parallel) | Dispute portal, ODR API, Mobile API | Phase 1 |
| Phase 6: Reporting & UAT | 2-3 weeks | All reports, UAT sign-off | Phase 4, Phase 5 |
| Phase 7: Parallel Run & Cutover | 4-6 weeks | Parallel run with ISG, cutover, hypercare | Phase 6 |

**Total Duration:** 28-40 weeks (7-10 months)

### 3.2 Phase 0: Discovery (2-3 weeks)

**Objectives:**
- Collect sample files from bank and NPCI
- Confirm CBS TTUM format and GL mapping
- Validate bank's role for each product
- Confirm hosting model and RPO/RTO
- Gap study against ISG scope

**Deliverables:**
1. Sample files for all products (CBS, Switch, NPCI)
2. CBS TTUM format specification
3. GL mapping documentation
4. Product role confirmation (issuer/acquirer/both)
5. Hosting model decision (bank DC / private cloud)
6. NPCI dispute filing method confirmation
7. Gap analysis report vs ISG
8. Signed-off requirements document

**Effort:**
- **Team:** 2 architects, 1 business analyst
- **Duration:** 2-3 weeks
- **Person-Months:** 3-4

**Scenario Differences:**
- **Scenario A:** Vendor provides gap analysis expertise
- **Scenario B:** Bank provides business requirements; vendor validates

**Risks:**
- Delay in receiving sample files from bank/NPCI
- Unclear GL mapping from finance team
- Hosting model decision delayed

**Mitigation:**
- Start sample file collection early
- Finance team engagement from Day 1
- Decision tree for hosting model with fallback options

### 3.3 Phase 1: Foundation (3-4 weeks)

**Objectives:**
- Set up infrastructure (Kubernetes, PostgreSQL, Kafka, etc.)
- Implement ingestion framework
- Define common schema
- Implement config engine
- Set up security and audit

**Deliverables:**
1. Infrastructure setup (Kubernetes cluster, databases, queues)
2. File ingestion service (SFTP poller, manual upload)
3. Common schema implementation
4. Configuration engine (file formats, match rules, TTUM rules)
5. Security layer (authentication, authorization, encryption)
6. Audit logging framework
7. CI/CD pipeline setup

**Effort:**
- **Team:** 4 developers, 1 DevOps engineer, 1 security engineer
- **Duration:** 3-4 weeks
- **Person-Months:** 12-16

**Scenario Differences:**
- **Scenario A:** Vendor manages infrastructure setup
- **Scenario B:** Bank IT team participates in infrastructure setup; vendor provides guidance

**Risks:**
- Infrastructure procurement delays
- Security clearance delays
- Common schema changes mid-development

**Mitigation:**
- Start infrastructure procurement in Phase 0
- Security review in parallel
- Schema versioning to support changes

### 3.4 Phase 2: UPI & IMPS (6-8 weeks)

**Objectives:**
- Implement UPI parser and reconciliation (remitter + beneficiary)
- Implement IMPS parser and reconciliation
- Implement TTUM generation for UPI/IMPS
- Implement GL balancing for UPI/IMPS
- Unit testing and integration testing

**Deliverables:**
1. UPI CBS parser
2. UPI Switch parser
3. UPI NPCI parser
4. UPI matching engine (3-way)
5. UPI TTUM generation
6. UPI GL balancing
7. IMPS CBS parser
8. IMPS Switch parser
9. IMPS NPCI parser
10. IMPS matching engine (3-way)
11. IMPS TTUM generation
12. IMPS GL balancing
13. Unit tests (90% coverage)
14. Integration tests
15. Performance tests (14 lakh txns in < 30 minutes)

**Effort:**
- **Team:** 6 developers, 2 QA engineers, 1 performance engineer
- **Duration:** 6-8 weeks
- **Person-Months:** 36-48

**Scenario Differences:**
- **Scenario A:** Vendor handles all development and testing
- **Scenario B:** Bank QA team participates in testing; bank provides UAT environment

**Risks:**
- Complex UPI cycle-wise settlement logic
- Performance target not met
- TTUM format mismatches with CBS

**Mitigation:**
- Early prototype for UPI cycle handling
- Performance testing from Week 2
- CBS TTUM format validation in Phase 0

### 3.5 Phase 3: NFS, RuPay, VISA (4-6 weeks)

**Objectives:**
- Implement NFS Issuer reconciliation
- Implement NFS Acquirer reconciliation
- Implement RuPay reconciliation
- Implement VISA reconciliation (with forex)
- TTUM and GL for Phase 3 products

**Deliverables:**
1. NFS Issuer CBS parser
2. NFS Issuer Switch parser
3. NFS Issuer NPCI parser
4. NFS Issuer matching engine
5. NFS Issuer TTUM (with compensation calculation)
6. NFS Issuer GL balancing
7. NFS Acquirer EJ parser
8. NFS Acquirer Switch parser
9. NFS Acquirer NPCI parser
10. NFS Acquirer matching engine
11. NFS Acquirer TTUM
12. NFS Acquirer GL balancing
13. RuPay CBS parser
14. RuPay Switch parser
15. RuPay NPCI parser
16. RuPay matching engine
17. RuPay TTUM
18. RuPay GL balancing
19. VISA CBS parser
20. VISA Switch parser
21. VISA clearing parser
22. VISA matching engine
23. VISA TTUM (with forex difference)
24. VISA GL balancing (with forex GL)
25. Unit tests and integration tests

**Effort:**
- **Team:** 6 developers, 2 QA engineers
- **Duration:** 4-6 weeks
- **Person-Months:** 24-36

**Scenario Differences:**
- **Scenario A:** Vendor handles all development
- **Scenario B:** Bank operations team provides requirements for NFS compensation rules

**Risks:**
- VISA forex complexity
- NFS compensation rule changes
- RuPay chargeback workflow complexity

**Mitigation:**
- VISA forex module in separate sub-team
- Configurable compensation rules
- Early engagement with VISA/NPCI for clarifications

### 3.6 Phase 4: AEPS, BBPS, NETC, PG, Gift Card (3-4 weeks)

**Objectives:**
- Implement AEPS reconciliation
- Implement BBPS reconciliation
- Implement NETC/FASTag reconciliation
- Implement Payment Gateway reconciliation
- Implement Gift Card reconciliation
- Complete TTUM and GL for all products

**Deliverables:**
1. AEPS CBS parser
2. AEPS Switch parser
3. AEPS NPCI parser
4. AEPS matching engine
5. AEPS TTUM
6. AEPS GL balancing
7. BBPS CBS parser
8. BBPS Switch parser
9. BBPS NPCI parser
10. BBPS matching engine
11. BBPS TTUM
12. BBPS GL balancing
13. NETC CBS parser
14. NETC Switch parser
15. NETC NPCI parser
16. NETC matching engine
17. NETC TTUM
18. NETC GL balancing
19. Payment Gateway parser
20. Payment Gateway matching engine
21. Payment Gateway TTUM
22. Payment Gateway GL balancing
23. Gift Card parser
24. Gift Card matching engine
25. Gift Card TTUM
26. Gift Card GL balancing
27. Unit tests and integration tests

**Effort:**
- **Team:** 5 developers, 2 QA engineers
- **Duration:** 3-4 weeks
- **Person-Months:** 15-20

**Scenario Differences:**
- **Scenario A:** Vendor handles all development
- **Scenario B:** Bank provides biller-specific requirements for BBPS

**Risks:**
- Low-volume products may have edge cases
- Gift card expiry logic complexity
- BBPS biller settlement variations

**Mitigation:**
- Configurable rules for low-volume products
- Gift card expiry as separate module
- BBPS biller-specific configs

### 3.7 Phase 5: Dispute Module (6-8 weeks, parallel with Phases 2-4)

**Objectives:**
- Implement branch dispute portal
- Implement central data pull for NPCI submission
- Implement ODR API integration
- Implement mobile banking API integration
- Implement NPCI submission (API or portal-assisted)
- Implement dispute workflow and TAT tracking

**Deliverables:**
1. Branch portal UI (React/Angular)
2. Dispute case management
3. Evidence upload and management
4. Dispute workflow (Raised → Validated → Filed → Accepted/Rejected → Closed)
5. TAT tracking and escalation
6. Central data pull (NPCI submission format)
7. ODR REST API
8. Mobile banking REST API
9. NPCI API integration
10. NPCI portal-assisted filing
11. Incoming dispute handling
12. Dispute TTUM generation
13. Dispute MIS reports
14. Unit tests and integration tests

**Effort:**
- **Team:** 4 developers (frontend), 3 developers (backend), 2 QA engineers
- **Duration:** 6-8 weeks (parallel with Phases 2-4)
- **Person-Months:** 27-36

**Scenario Differences:**
- **Scenario A:** Vendor provides dispute operations team
- **Scenario B:** Bank branch staff use portal; bank IT integrates ODR/mobile APIs

**Risks:**
- NPCI API integration delays
- ODR/mobile API integration dependencies
- Dispute workflow complexity

**Mitigation:**
- Mock NPCI API for development
- Early engagement with bank website/mobile teams
- Configurable dispute workflow

### 3.8 Phase 6: Reporting & UAT (2-3 weeks)

**Objectives:**
- Implement all regulatory and operational reports
- User acceptance testing
- Performance testing
- Security testing (VAPT)

**Deliverables:**
1. Daily recon summary report
2. Exception ageing report
3. TTUM register report
4. GL balancing report
5. GL difference report
6. Settlement verification report
7. Dispute reports
8. NPCI TAT compliance report
9. RBI compliance reports (failed transaction TAT, compensation)
10. File-receipt tracker report
11. Audit reports
12. Dashboard (UI with real-time metrics)
13. Scheduled report delivery (email/portal)
14. UAT test cases
15. UAT sign-off from bank operations
16. UAT sign-off from bank finance
17. Performance test report
18. VAPT report
19. Security remediation

**Effort:**
- **Team:** 3 developers, 2 QA engineers, 1 security engineer
- **Duration:** 2-3 weeks
- **Person-Months:** 6-9

**Scenario Differences:**
- **Scenario A:** Vendor provides UAT environment; bank operations team tests
- **Scenario B:** Bank provides UAT environment; bank operations and finance teams test

**Risks:**
- UAT findings require significant rework
- VAPT findings critical
- Performance not meeting targets

**Mitigation:**
- Regular demos during development
- Early security review
- Performance testing throughout

### 3.9 Phase 7: Parallel Run & Cutover (4-6 weeks)

**Objectives:**
- Parallel run with ISG (1-2 months)
- Compare results (match counts, exceptions, TTUM, GL)
- Address differences
- Cutover to production
- Hypercare support

**Deliverables:**
1. Parallel run plan
2. Data migration scripts (if needed)
3. Comparison reports (Platform vs ISG)
4. Difference analysis and resolution
5. Cutover plan
6. Cutover execution
7. Hypercare support (2 weeks)
8. Handover documentation
9. Training materials
10. Training sessions

**Effort:**
- **Team:** 2 developers, 1 DevOps engineer, 1 trainer
- **Duration:** 4-6 weeks
- **Person-Months:** 8-12

**Scenario Differences:**
- **Scenario A:** Vendor operations team handles parallel run; bank only compares results
- **Scenario B:** Bank operations team runs parallel; vendor provides support

**Risks:**
- Significant differences between platform and ISG
- Cutover fails
- Performance issues in production
- Bank staff not trained in time

**Mitigation:**
- Daily comparison during parallel run
- Fallback plan (revert to ISG)
- Load testing in production-like environment
- Training starts in Phase 5

---

## 4. Effort Estimates

### 4.1 Total Effort by Phase

| Phase | Duration | Team Size | Person-Months |
|-------|----------|-----------|--------------|
| Phase 0: Discovery | 2-3 weeks | 3 | 3-4 |
| Phase 1: Foundation | 3-4 weeks | 6 | 12-16 |
| Phase 2: UPI & IMPS | 6-8 weeks | 9 | 36-48 |
| Phase 3: NFS, RuPay, VISA | 4-6 weeks | 8 | 24-36 |
| Phase 4: AEPS, BBPS, NETC, PG, Gift Card | 3-4 weeks | 7 | 15-20 |
| Phase 5: Dispute Module | 6-8 weeks (parallel) | 9 | 27-36 |
| Phase 6: Reporting & UAT | 2-3 weeks | 6 | 6-9 |
| Phase 7: Parallel Run & Cutover | 4-6 weeks | 4 | 8-12 |
| **Total** | **28-40 weeks** | **Peak: 9** | **131-181** |

### 4.2 Effort by Role

| Role | Peak Count | Total Person-Months |
|------|------------|---------------------|
| Architect | 2 | 12-16 |
| Business Analyst | 1 | 4-6 |
| Developer (Backend) | 6 | 60-80 |
| Developer (Frontend) | 2 | 12-16 |
| DevOps Engineer | 2 | 12-16 |
| Security Engineer | 1 | 6-8 |
| QA Engineer | 3 | 18-24 |
| Performance Engineer | 1 | 6-8 |
| Trainer | 1 | 2-3 |
| **Total** | **19** | **132-177** |

### 4.3 Scenario-Specific Effort

**Scenario A: With Manpower Support (Vendor-Managed)**
- Development: 132-177 person-months (vendor)
- Bank UAT: 4-6 person-months (bank staff)
- Bank Training: 2-3 person-months (bank staff)
- **Total Effort:** 138-186 person-months

**Scenario B: Without Manpower Support (Bank-Managed)**
- Development: 132-177 person-months (vendor)
- Bank UAT: 4-6 person-months (bank staff)
- Bank Training: 8-12 person-months (bank staff - more extensive)
- Bank Staff Hiring/Training (before Phase 0): 8-12 person-months
- **Total Effort:** 152-207 person-months

**Difference:** Scenario B requires 14-21 additional person-months from bank

### 4.4 Cost Estimates (Indicative)

**Development Cost (One-time):**
- Scenario A: ₹2.5-3.5 crore
- Scenario B: ₹2.5-3.5 crore (same development cost)

**Operations Cost (Annual):**
- Scenario A: ₹1.5-2.5 crore (vendor operations fee based on volume)
- Scenario B: ₹0.3-0.5 crore (maintenance only)

**3-Year Total Cost:**
- Scenario A: ₹7-11 crore
- Scenario B: ₹3.4-4.5 crore

**Break-even Point:** 12-18 months (Scenario B becomes cheaper after 1-1.5 years)

---

## 5. Resource Requirements

### 5.1 Infrastructure Requirements

**Primary Data Center:**
- Kubernetes Nodes: 3 control plane + 6 worker nodes
- CPU: 16 cores per worker node (96 cores total)
- RAM: 64GB per worker node (384GB total)
- Storage: 1TB SSD per worker node (6TB total)
- Network: 10Gbps internal, 1Gbps external

**Disaster Recovery Site:**
- Kubernetes Nodes: 2 control plane + 4 worker nodes
- CPU: 16 cores per worker node (64 cores total)
- RAM: 64GB per worker node (256GB total)
- Storage: 1TB SSD per worker node (4TB total)
- Network: 10Gbps internal, 1Gbps external

**Total Storage:**
- Database: 2TB
- Object Storage: 10TB
- Logs: 5TB
- Backups: 20TB
- **Total:** 37TB

### 5.2 Software Requirements

**Commercial Software:**
- PostgreSQL: Open source (or Oracle if bank mandates)
- Redis: Open source
- Kafka: Open source (Confluent Enterprise optional)
- MinIO: Open source (or AWS S3 if cloud)
- Harbor: Open source (container registry)
- Elasticsearch: Open source (ELK Stack)

**Open Source Software:**
- Kubernetes: Open source
- Spring Boot: Open source
- React/Angular: Open source
- Prometheus: Open source
- Grafana: Open source
- Trivy: Open source (vulnerability scanning)

### 5.3 Bank Staff Requirements

**Scenario A: With Manpower Support (Vendor-Managed)**
- **Bank Staff Required:**
  - TTUM Checker/Approver: 2 (from finance/operations)
  - GL Approver: 1 (from finance)
  - Auditor: 1 (from internal audit)
  - IT Liaison: 1 (from IT)
  - **Total:** 5

**Scenario B: Without Manpower Support (Bank-Managed)**
- **Bank Staff Required:**
  - L1 Recon Operator: 3-4 (from operations)
  - L2 Dispute Handler: 2-3 (from operations)
  - L3 Admin/Config: 1-2 (from IT)
  - TTUM Maker: 2-3 (from operations)
  - TTUM Checker/Approver: 2 (from finance/operations)
  - GL Approver: 1 (from finance)
  - Auditor: 1 (from internal audit)
  - **Total:** 12-16

---

## 6. Risk Assessment

### 6.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance target not met (14 lakh txns in < 30 min) | Medium | High | Early performance testing, horizontal scaling, optimization |
| Database performance issues | Medium | High | Partitioning, indexing, connection pooling, read replicas |
| File format changes from NPCI/bank | High | Medium | Config-driven parsers, versioning, quick adaptation |
| Integration with CBS fails | Low | Critical | CBS API validation in Phase 0, fallback to file upload |
| Security vulnerabilities | Medium | High | Security review, VAPT, regular patching |
| Data loss during migration | Low | Critical | Backup strategy, validation, rollback plan |

### 6.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Sample files not received on time | High | Medium | Start collection early, use mock data for development |
| GL mapping not provided by finance | Medium | High | Finance engagement from Day 1, use defaults initially |
| Bank staff not trained in time (Scenario B) | Medium | High | Training starts early, vendor provides trainers |
| Parallel run shows significant differences | Medium | High | Daily comparison, quick issue resolution, fallback plan |
| ISG transition issues | Low | High | Detailed transition plan, ISG cooperation, legal review |

### 6.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| DR failover fails | Low | Critical | Regular DR drills, documented procedures |
| Vendor dependency (Scenario A) | Medium | Medium | Source code escrow, knowledge transfer |
| Bank staff turnover (Scenario B) | Medium | Medium | Documentation, training, cross-training |
| SLA breaches (Scenario A) | Low | Medium | SLA penalties, vendor incentives |

---

## 7. Success Criteria

### 7.1 Technical Success Criteria

- [ ] Reconcile 14 lakh transactions in under 30 minutes
- [ ] UI list screens return in under 3 seconds with pagination
- [ ] Zero data loss during parallel run and cutover
- [ ] 99.9% uptime during hypercare period
- [ ] All VAPT findings addressed before production
- [ ] DR failover under 1 hour (RTO)
- [ ] Data loss under 5 minutes (RPO)

### 7.2 Business Success Criteria

- [ ] All 11 products implemented and tested
- [ ] Match rate > 95% for UPI, > 90% for other products
- [ ] Exception TAT compliance > 98%
- [ ] TTUM generation accuracy > 99%
- [ ] GL difference < 0.1% of total volume
- [ ] Dispute resolution TAT compliance > 95%
- [ ] User satisfaction score > 4/5

### 7.3 Scenario-Specific Success Criteria

**Scenario A: With Manpower Support**
- [ ] Vendor meets all SLAs
- [ ] Bank approves all vendor operations
- [ ] Training completed for bank approvers
- [ ] Handover documentation complete

**Scenario B: Without Manpower Support**
- [ ] Bank staff trained and certified
- [ ] Bank operations team achieves SLAs
- [ ] Bank IT team can handle L3 issues
- [ ] Vendor provides adequate support

---

## 8. Recommendation

### 8.1 Recommended Approach

**Hybrid Approach:** Start with Scenario A (Vendor-Managed) for first 12-18 months, then transition to Scenario B (Bank-Managed).

**Rationale:**
1. **Lower Risk:** Vendor expertise ensures smooth initial operations
2. **Knowledge Transfer:** Bank staff learn from vendor during this period
3. **Gradual Transition:** Bank can gradually take over operations
4. **Cost Optimization:** After transition, bank saves on ongoing fees

### 8.2 Transition Plan

**Months 1-12:** Vendor-Managed (Scenario A)
- Vendor handles all operations
- Bank staff observes and learns
- Quarterly knowledge transfer sessions

**Months 13-18:** Transition Period
- Bank staff start handling L1 operations
- Vendor handles L2/L3 and escalations
- Joint SLAs

**Month 19+:** Bank-Managed (Scenario B)
- Bank handles all operations
- Vendor provides only L3 support (maintenance)
- Annual maintenance contract

### 8.3 Cost Summary (Hybrid Approach)

**Year 1:** ₹4-5 crore (development + vendor operations)
**Year 2:** ₹3-4 crore (vendor operations + partial bank operations)
**Year 3+:** ₹0.5-1 crore (maintenance only)

**3-Year Total:** ₹7.5-10 crore

### 8.4 Next Steps

1. **Immediate (Week 1):**
   - Kick-off meeting with bank stakeholders
   - Sign-off on phased delivery plan
   - Start sample file collection
   - Begin infrastructure procurement

2. **Short-term (Month 1):**
   - Complete Phase 0 (Discovery)
   - Finalize hosting model decision
   - Sign-off on requirements
   - Start Phase 1 (Foundation)

3. **Medium-term (Months 2-6):**
   - Complete Phases 1-4
   - Complete Phase 5 (Dispute Module)
   - Regular demos to bank stakeholders
   - Mid-project review

4. **Long-term (Months 7-10):**
   - Complete Phases 6-7
   - UAT sign-off
   - Parallel run
   - Cutover
   - Hypercare
   - Handover

---

## Appendix A: Gantt Chart (Summary)

```
Phase 0: Discovery          [==]
Phase 1: Foundation        [====]
Phase 2: UPI & IMPS       [========]
Phase 3: NFS, RuPay, VISA  [======]
Phase 4: Remaining Products[====]
Phase 5: Dispute Module    [========] (parallel)
Phase 6: Reporting & UAT   [===]
Phase 7: Parallel Run      [======]

Total: 28-40 weeks
```

---

## Appendix B: Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| M1: Requirements Sign-off | Week 3 | Signed requirements document |
| M2: Infrastructure Ready | Week 7 | Kubernetes cluster operational |
| M3: UPI/IMPS Complete | Week 15 | UPI/IMPS recon, TTUM, GL ready |
| M4: All Products Complete | Week 23 | All 11 products implemented |
| M5: Dispute Module Complete | Week 23 | Dispute portal, APIs ready |
| M6: UAT Sign-off | Week 26 | Bank operations and finance sign-off |
| M7: Parallel Run Start | Week 27 | Parallel run with ISG begins |
| M8: Cutover | Week 33 | Production cutover |
| M9: Hypercare End | Week 35 | Hypercare support ends |
| M10: Handover Complete | Week 37 | Full handover to bank |

---

**End of Phased Delivery Plan**
