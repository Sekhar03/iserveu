# Deployment Plan (Containers, HA/DR) and Security Checklist

**Version:** 1.0  
**Date:** 2026-10-15  
**Prepared for:** Saraswat Co-operative Bank Ltd.

---

## Table of Contents

1. [Deployment Architecture](#1-deployment-architecture)
2. [Containerisation Strategy](#2-containerisation-strategy)
3. [Kubernetes Deployment](#3-kubernetes-deployment)
4. [High Availability Setup](#4-high-availability-setup)
5. [Disaster Recovery Plan](#5-disaster-recovery-plan)
6. [Monitoring and Observability](#6-monitoring-and-observability)
7. [Security Checklist](#7-security-checklist)
8. [Backup and Restore Procedures](#8-backup-and-restore-procedures)
9. [Deployment Pipeline](#9-deployment-pipeline)
10. [Operational Procedures](#10-operational-procedures)

---

## 1. Deployment Architecture

### 1.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Load Balancer (NGINX/HAProxy)                          │
│                            (Active-Active)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (Primary DC)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Ingress      │  │ Ingress      │  │ Ingress      │  │ Ingress      │   │
│  │ Controller   │  │ Controller   │  │ Controller   │  │ Controller   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ API Gateway  │  │ API Gateway  │  │ API Gateway  │  │ API Gateway  │   │
│  │ (3 replicas) │  │ (3 replicas) │  │ (3 replicas) │  │ (3 replicas) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ File         │  │ Parser       │  │ Matching     │  │ Exception    │   │
│  │ Ingestion    │  │ Service     │  │ Engine       │  │ Management   │   │
│  │ (3 replicas) │  │ (3 replicas) │  │ (3 replicas) │  │ (3 replicas) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ TTUM         │  │ GL Balancing │  │ Dispute      │  │ Reporting    │   │
│  │ Generator    │  │ Engine       │  │ Service      │  │ Service      │   │
│  │ (2 replicas) │  │ (2 replicas) │  │ (2 replicas) │  │ (2 replicas) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ PostgreSQL   │  │ PostgreSQL   │  │ Redis        │  │ Redis        │   │
│  │ Primary      │  │ Standby      │  │ Master       │  │ Replica      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Kafka        │  │ Kafka        │  │ Kafka        │  │ MinIO        │   │
│  │ Broker 1     │  │ Broker 2     │  │ Broker 3     │  │ (4 nodes)    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                            ↓ (Async Replication)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (DR Site)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  (Similar setup to Primary DC, but with 2 nodes instead of 3)             │
│  PostgreSQL: Hot standby                                                   │
│  Kafka: 2 brokers                                                          │
│  Redis: 1 master + 1 replica                                               │
│  MinIO: 2 nodes                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Infrastructure Requirements

**Primary Data Center:**
- **Kubernetes Nodes:** 3 control plane + 6 worker nodes
- **CPU per Worker Node:** 16 cores
- **RAM per Worker Node:** 64GB
- **Storage per Worker Node:** 1TB SSD
- **Network:** 10Gbps internal, 1Gbps external

**Disaster Recovery Site:**
- **Kubernetes Nodes:** 2 control plane + 4 worker nodes
- **CPU per Worker Node:** 16 cores
- **RAM per Worker Node:** 64GB
- **Storage per Worker Node:** 1TB SSD
- **Network:** 10Gbps internal, 1Gbps external

**Total Storage Requirements:**
- Database: 2TB (with growth buffer)
- Object Storage: 10TB (raw files + archives, 5-year retention)
- Logs: 5TB (with rotation)
- Backups: 20TB (30-day retention)

---

## 2. Containerisation Strategy

### 2.1 Dockerfile Example (Spring Boot Application)

```dockerfile
# Multi-stage build for optimal image size
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install required packages
RUN apk add --no-cache tzdata curl

# Create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM options
ENV JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 2.2 Docker Compose (Development)

```yaml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: recon-postgres
    environment:
      POSTGRES_DB: recon_db
      POSTGRES_USER: recon_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recon_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: recon-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: recon-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: recon-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"

  # MinIO (Object Storage)
  minio:
    image: minio/minio:latest
    container_name: recon-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: recon-app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      kafka:
        condition: service_started
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/recon_db
      SPRING_DATASOURCE_USERNAME: recon_user
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: ${MINIO_PASSWORD}
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 2.3 Image Registry Strategy

- **Private Registry:** Harbor or GitLab Registry
- **Image Tagging:** 
  - `latest` for latest stable
  - `v1.0.0` for versioned releases
  - `commit-sha` for CI/CD builds
- **Image Scanning:** Trivy for vulnerability scanning
- **Image Signing:** Cosign for image verification

---

## 3. Kubernetes Deployment

### 3.1 Namespace Structure

```yaml
# namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: recon-prod
---
apiVersion: v1
kind: Namespace
metadata:
  name: recon-staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: recon-monitoring
```

### 3.2 ConfigMap (Application Configuration)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: recon-prod
data:
  application.yml: |
    spring:
      datasource:
        url: jdbc:postgresql://postgres-service:5432/recon_db
        username: ${DB_USERNAME}
        password: ${DB_PASSWORD}
        hikari:
          maximum-pool-size: 50
          minimum-idle: 10
      redis:
        host: redis-service
        port: 6379
        timeout: 5000
      kafka:
        bootstrap-servers: kafka-service:9092
        consumer:
          group-id: recon-group
    management:
      endpoints:
        web:
          exposure:
            include: health,metrics,prometheus
      metrics:
        export:
          prometheus:
            enabled: true
    logging:
      level:
        com.bank.reconciliation: INFO
        org.springframework: WARN
```

### 3.3 Secret (Sensitive Data)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: recon-prod
type: Opaque
stringData:
  db-username: recon_user
  db-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  minio-access-key: minioadmin
  minio-secret-key: <base64-encoded-password>
  api-encryption-key: <base64-encoded-key>
```

### 3.4 Deployment (File Ingestion Service)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: file-ingestion-service
  namespace: recon-prod
  labels:
    app: file-ingestion
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: file-ingestion
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: file-ingestion
        version: v1
    spec:
      serviceAccountName: recon-service-account
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: file-ingestion
        image: harbor.saraswatbank.com/recon/file-ingestion:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: config
        configMap:
          name: app-config
      - name: logs
        emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - file-ingestion
              topologyKey: kubernetes.io/hostname
```

### 3.5 Service (Load Balancer)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: file-ingestion-service
  namespace: recon-prod
  labels:
    app: file-ingestion
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: file-ingestion
```

### 3.6 Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: file-ingestion-hpa
  namespace: recon-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: file-ingestion-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### 3.7 PostgreSQL StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: recon-prod
spec:
  serviceName: postgres-service
  replicas: 2
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: recon_db
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "8Gi"
            cpu: "2000m"
          limits:
            memory: "16Gi"
            cpu: "4000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 500Gi
```

---

## 4. High Availability Setup

### 4.1 PostgreSQL HA Configuration

**Streaming Replication Setup:**

```sql
-- On Primary
-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';

-- Configure pg_hba.conf
host replication replicator 10.0.0.0/8 scram-sha-256

-- Configure postgresql.conf
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1GB
synchronous_commit = on
synchronous_standby_names = 'standby1'

-- On Standby
-- Configure recovery.conf
standby_mode = on
primary_conninfo = 'host=primary-db host=10.0.1.10 port=5432 user=replicator password=replicator_password'
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
```

**Automatic Failover with Patroni:**

```yaml
# patroni-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: patroni-config
  namespace: recon-prod
data:
  patroni.yml: |
    scope: postgres-cluster
    name: postgres-0
    restapi:
      listen: 0.0.0.0:8008
      connect_address: 10.0.1.10:8008
    postgresql:
      listen: 0.0.0.0:5432
      connect_address: 10.0.1.10:5432
      data_dir: /var/lib/postgresql/data
      bin_dir: /usr/lib/postgresql/15/bin
      authentication:
        replication:
          username: replicator
          password: replicator_password
        superuser:
          username: postgres
          password: postgres_password
      parameters:
        max_connections: 200
        shared_buffers: 4GB
        effective_cache_size: 12GB
        maintenance_work_mem: 1GB
        checkpoint_completion_target: 0.9
        wal_buffers: 16MB
        default_statistics_target: 100
        random_page_cost: 1.1
        effective_io_concurrency: 200
        work_mem: 2621kB
        min_wal_size: 1GB
        max_wal_size: 4GB
    bootstrap:
      dcs:
        ttl: 30
        loop_wait: 10
        retry_timeout: 10
        maximum_lag_on_failover: 1048576
    tags:
      nofailover: false
      noloadbalance: false
      clonefrom: false
      nosync: false
```

### 4.2 Redis HA Configuration

**Redis Sentinel Setup:**

```yaml
# redis-sentinel-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-sentinel-config
  namespace: recon-prod
data:
  sentinel.conf: |
    port 26379
    dir /tmp
    sentinel monitor mymaster redis-service 6379 2
    sentinel auth-pass mymaster redis_password
    sentinel down-after-milliseconds mymaster 5000
    sentinel parallel-syncs mymaster 1
    sentinel failover-timeout mymaster 10000
    sentinel announce-ip 10.0.1.20
    sentinel announce-port 26379
```

### 4.3 Kafka HA Configuration

**Kafka Broker Configuration:**

```properties
# server.properties
broker.id=1
listeners=PLAINTEXT://:9092
advertised.listeners=PLAINTEXT://10.0.1.30:9092
zookeeper.connect=zk-1:2181,zk-2:2181,zk-3:2181
log.dirs=/kafka/logs
num.partitions=10
default.replication.factor=3
min.insync.replicas=2
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connection.timeout.ms=6000
unclean.leader.election.enable=false
auto.create.topics.enable=true
```

### 4.4 Application HA

**Pod Anti-Affinity:**

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - file-ingestion
      topologyKey: kubernetes.io/hostname
```

**Pod Disruption Budget:**

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: file-ingestion-pdb
  namespace: recon-prod
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: file-ingestion
```

---

## 5. Disaster Recovery Plan

### 5.1 DR Strategy

**RPO (Recovery Point Objective):** < 5 minutes  
**RTO (Recovery Time Objective):** < 1 hour

**Replication Strategy:**
- **Database:** Streaming replication (async, sync if network permits)
- **Kafka:** MirrorMaker 2.0 for topic replication
- **Redis:** Redis Cluster with cross-data-center replication
- **Object Storage:** MinIO gateway mode with versioning and replication

### 5.2 Failover Procedure

**Manual Failover Steps:**

1. **Database Failover:**
   ```bash
   # Promote standby to primary
   patronictl switchover --force postgres-cluster
   
   # Update application configuration
   kubectl set env deployment/app DB_HOST=dr-postgres-service
   ```

2. **Kafka Failover:**
   ```bash
   # Update bootstrap servers
   kubectl set env deployment/app KAFKA_BOOTSTRAP_SERVERS=dr-kafka-1:9092,dr-kafka-2:9092
   ```

3. **Redis Failover:**
   ```bash
   # Update Redis master
   kubectl set env deployment/app REDIS_HOST=dr-redis-master
   ```

4. **DNS Update:**
   ```bash
   # Update DNS to point to DR site
   # Use automated DNS management (e.g., Route53, Cloudflare)
   ```

### 5.3 Backup Strategy

**Database Backup:**

```bash
# Daily full backup
pg_dump -h postgres-primary -U postgres -d recon_db | gzip > /backup/recon_db_$(date +%Y%m%d).sql.gz

# WAL archiving (continuous)
archive_command = 'cp %p /wal_archive/%f'

# Weekly full backup with pg_basebackup
pg_basebackup -h postgres-primary -D /backup/basebackup -U replicator -Ft -z -P
```

**Object Storage Backup:**

```bash
# Sync to backup location
rclone sync minio:recon-primary backup:recon-backup --backup-dir backup:recon-backup-versions

# Cross-region replication (if using cloud)
# Configure lifecycle policies for tiered storage
```

**Configuration Backup:**

```bash
# Backup Kubernetes resources
kubectl get all -n recon-prod -o yaml > /backup/k8s-resources-$(date +%Y%m%d).yaml

# Backup ConfigMaps and Secrets
kubectl get configmaps -n recon-prod -o yaml > /backup/configmaps-$(date +%Y%m%d).yaml
kubectl get secrets -n recon-prod -o yaml > /backup/secrets-$(date +%Y%m%d).yaml
```

### 5.4 Restore Procedure

**Database Restore:**

```bash
# Restore from full backup
gunzip < /backup/recon_db_20261015.sql.gz | psql -h postgres-restore -U postgres -d recon_db

# Replay WAL archives
# Configure recovery.conf
restore_command = 'cp /wal_archive/%f %p'
```

**Application Restore:**

```bash
# Restore Kubernetes resources
kubectl apply -f /backup/k8s-resources-20261015.yaml

# Restore ConfigMaps and Secrets
kubectl apply -f /backup/configmaps-20261015.yaml
kubectl apply -f /backup/secrets-20261015.yaml
```

---

## 6. Monitoring and Observability

### 6.1 Prometheus Monitoring

**Prometheus Configuration:**

```yaml
# prometheus-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: recon-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

### 6.2 Grafana Dashboards

**Key Dashboards:**
1. **Application Metrics:** JVM memory, CPU, thread pools, HTTP requests
2. **Database Metrics:** Connection pool, query performance, replication lag
3. **Kafka Metrics:** Message throughput, consumer lag, broker health
4. **Kubernetes Metrics:** Pod status, resource usage, HPA status
5. **Business Metrics:** Reconciliation throughput, exception counts, TTUM generation rate

### 6.3 Alerting Rules

**Prometheus Alert Rules:**

```yaml
# alert-rules.yaml
groups:
- name: application-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      description: Error rate is {{ $value }} errors per second
  
  - alert: HighMemoryUsage
    expr: jvm_memory_used_bytes / jvm_memory_max_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High memory usage
      description: Memory usage is {{ $value | humanizePercentage }}
  
  - alert: DatabaseReplicationLag
    expr: pg_stat_replication_lag_seconds > 300
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: Database replication lag
      description: Replication lag is {{ $value }} seconds
```

### 6.4 Logging

**ELK Stack Configuration:**

```yaml
# logstash-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
  namespace: recon-monitoring
data:
  logstash.conf: |
    input {
      kafka {
        bootstrap_servers => "kafka-service:9092"
        topics => ["application-logs"]
        codec => json
      }
    }
    filter {
      if [kubernetes] {
        mutate {
          add_field => { "namespace" => "%{[kubernetes][namespace_name]}" }
          add_field => { "pod" => "%{[kubernetes][pod_name]}" }
        }
      }
    }
    output {
      elasticsearch {
        hosts => ["elasticsearch-service:9200"]
        index => "recon-logs-%{+YYYY.MM.dd}"
      }
    }
```

---

## 7. Security Checklist

### 7.1 Network Security

- [ ] **Firewall Rules:**
  - [ ] Only allow necessary ports (80, 443, 22)
  - [ ] Block all inbound traffic except from trusted sources
  - [ ] Implement network segmentation (DMZ, internal, DB)
  - [ ] Use NetworkPolicies in Kubernetes

- [ ] **TLS/SSL:**
  - [ ] Enable TLS 1.3 everywhere
  - [ ] Use valid SSL certificates from trusted CA
  - [ ] Enable HSTS (HTTP Strict Transport Security)
  - [ ] Configure cipher suites (disable weak ciphers)

- [ ] **Ingress Security:**
  - [ ] Implement rate limiting
  - [ ] Enable IP whitelisting for admin endpoints
  - [ ] Use WAF (Web Application Firewall)
  - [ ] Enable request/response logging

### 7.2 Application Security

- [ ] **Authentication:**
  - [ ] Implement OAuth2/JWT for API authentication
  - [ ] Implement API key authentication for external integrations
  - [ ] Enable MFA for admin users
  - [ ] Implement session timeout (30 minutes)
  - [ ] Use secure cookie flags (HttpOnly, Secure, SameSite)

- [ ] **Authorization:**
  - [ ] Implement RBAC (Role-Based Access Control)
  - [ ] Enforce least privilege principle
  - [ ] Implement maker-checker for critical operations
  - [ ] Audit all permission changes

- [ ] **Input Validation:**
  - [ ] Validate all user inputs
  - [ ] Sanitize data to prevent XSS
  - [ ] Use parameterized queries to prevent SQL injection
  - [ ] Implement CSRF protection

- [ ] **Dependencies:**
  - [ ] Scan dependencies for vulnerabilities (Snyk, OWASP Dependency-Check)
  - [ ] Keep dependencies up to date
  - [ ] Use only trusted repositories

### 7.3 Data Security

- [ ] **Encryption at Rest:**
  - [ ] Enable database encryption (TDE or application-level)
  - [ ] Encrypt object storage (SSE-S3 or SSE-KMS)
  - [ ] Encrypt backups
  - [ ] Use AES-256 encryption

- [ ] **Encryption in Transit:**
  - [ ] Enable TLS for all connections
  - [ ] Use mutual TLS for service-to-service communication
  - [ ] Encrypt Kafka traffic
  - [ ] Encrypt Redis traffic (stunnel)

- [ ] **Key Management:**
  - [ ] Use HSM or KMS for key management
  - [ ] Rotate encryption keys regularly
  - [ ] Never store keys in code or config files
  - [ ] Use Kubernetes Secrets or Vault for secrets

- [ ] **PII/PCI Compliance:**
  - [ ] Mask PAN (first 6 + last 4 digits)
  - [ ] Never store full Aadhaar number
  - [ ] Encrypt account numbers at rest
  - [ ] Mask PII in logs and UI
  - [ ] Implement data retention policy

### 7.4 Container Security

- [ ] **Image Security:**
  - [ ] Use minimal base images (alpine, distroless)
  - [ ] Scan images for vulnerabilities (Trivy)
  - [ ] Sign images (Cosign)
  - [ ] Use non-root user in containers
  - [ ] Enable read-only root filesystem

- [ ] **Runtime Security:**
  - [ ] Implement Pod Security Policies
  - [ ] Use security contexts (runAsNonRoot, drop capabilities)
  - [ ] Limit container capabilities
  - [ ] Implement resource limits
  - [ ] Enable seccomp profiles

- [ ] **Network Security:**
  - [ ] Use NetworkPolicies
  - [ ] Implement service mesh (Istio, Linkerd)
  - [ ] Enable mTLS for service-to-service communication
  - [ ] Monitor network traffic

### 7.5 Audit and Compliance

- [ ] **Audit Logging:**
  - [ ] Log all critical operations
  - [ ] Log user actions (login, logout, approvals)
  - [ ] Log configuration changes
  - [ ] Log file operations
  - [ ] Implement immutable audit log

- [ ] **Monitoring:**
  - [ ] Monitor for security events
  - [ ] Implement alerting for suspicious activity
  - [ ] Monitor for failed login attempts
  - [ ] Monitor for privilege escalation

- [ ] **Compliance:**
  - [ ] RBI compliance (failed transaction TAT, compensation)
  - [ ] NPCI compliance (dispute filing, settlement)
  - [ ] PCI DSS compliance (card data handling)
  - [ ] Data residency (data stored in India)

### 7.6 Vulnerability Management

- [ ] **Regular Scanning:**
  - [ ] Scan code repositories (SAST)
  - [ ] Scan running containers (DAST)
  - [ ] Scan dependencies (SCA)
  - [ ] Perform VAPT annually

- [ ] **Patch Management:**
  - [ ] Patch OS vulnerabilities promptly
  - [ ] Patch application dependencies
  - [ ] Patch container images
  - [ ] Test patches before deployment

- [ ] **Incident Response:**
  - [ ] Establish incident response team
  - [ ] Define incident response procedures
  - [ ] Conduct regular drills
  - [ ] Document lessons learned

---

## 8. Backup and Restore Procedures

### 8.1 Backup Schedule

| Resource | Frequency | Retention | Type |
|----------|-----------|-----------|------|
| Database (Full) | Daily | 30 days | pg_dump |
| Database (WAL) | Continuous | 7 days | WAL archive |
| Database (Basebackup) | Weekly | 12 weeks | pg_basebackup |
| Object Storage | Daily | 5 years | Rclone sync |
| Configuration | On change | 1 year | Git |
| Kubernetes Resources | Daily | 30 days | Velero |
| Logs | Daily | 90 days | ELK snapshot |

### 8.2 Backup Verification

- **Weekly:** Restore test database from backup
- **Monthly:** Full DR drill (failover to DR site)
- **Quarterly:** Review backup retention and compliance

### 8.3 Restore Testing

```bash
# Monthly restore test script
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_FILE="/backup/recon_db_${DATE}.sql.gz"

# Create test database
psql -h postgres-test -U postgres -c "DROP DATABASE IF EXISTS recon_test;"
psql -h postgres-test -U postgres -c "CREATE DATABASE recon_test;"

# Restore backup
gunzip < $BACKUP_FILE | psql -h postgres-test -U postgres -d recon_test

# Verify data
RECORD_COUNT=$(psql -h postgres-test -U postgres -d recon_test -t -c "SELECT COUNT(*) FROM txn_normalised;")
echo "Restored record count: $RECORD_COUNT"

# Cleanup
psql -h postgres-test -U postgres -c "DROP DATABASE recon_test;"
```

---

## 9. Deployment Pipeline

### 9.1 CI/CD Pipeline (GitLab CI)

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - security-scan
  - deploy-staging
  - deploy-production

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_DRIVER: overlay2

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest

test:
  stage: test
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn clean test
  coverage: '/Total.*?([0-9]{1,3})%/'

security-scan:
  stage: security-scan
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context staging
    - kubectl set image deployment/file-ingestion-service file-ingestion=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n recon-staging
    - kubectl rollout status deployment/file-ingestion-service -n recon-staging
  only:
    - develop

deploy-production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context production
    - kubectl set image deployment/file-ingestion-service file-ingestion=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n recon-prod
    - kubectl rollout status deployment/file-ingestion-service -n recon-prod
  when: manual
  only:
    - main
```

### 9.2 Release Strategy

- **Blue-Green Deployment:** Zero-downtime deployments
- **Canary Deployment:** Gradual rollout to subset of users
- **Rollback Strategy:** Quick rollback to previous version

---

## 10. Operational Procedures

### 10.1 Daily Operations

**Morning Checks:**
1. Verify all pods are running
2. Check database replication lag
3. Review error logs from previous night
4. Verify daily reconciliation completed successfully
5. Check disk space on all nodes

**Throughout Day:**
1. Monitor application metrics (CPU, memory, response time)
2. Monitor queue backlog (Kafka consumer lag)
3. Review alerts and respond promptly
4. Monitor file ingestion (expected files received)

**End of Day:**
1. Verify daily backups completed
2. Review daily reconciliation summary
3. Check for any pending exceptions
4. Review TTUM generation status
5. Verify GL balancing completed

### 10.2 Weekly Operations

1. Review security logs for suspicious activity
2. Review and rotate API keys if needed
3. Check resource utilization trends
4. Review performance metrics
5. Plan maintenance windows if needed

### 10.3 Monthly Operations

1. Perform full DR drill
2. Review and update documentation
3. Review capacity planning
4. Perform vulnerability scanning
5. Review and update security policies

### 10.4 Incident Response

**Severity Levels:**
- **P1 (Critical):** System down, complete outage
- **P2 (High):** Major functionality impacted
- **P3 (Medium):** Partial functionality impacted
- **P4 (Low):** Minor issue, workaround available

**Response Times:**
- P1: 15 minutes
- P2: 30 minutes
- P3: 2 hours
- P4: 4 hours

**Escalation Matrix:**
- L1: Operations team
- L2: Engineering team
- L3: Architecture team
- L4: CTO/CIO

---

**End of Deployment Plan and Security Checklist**
