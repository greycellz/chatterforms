# Google Cloud Platform (GCP) Setup for ChatterForms

## Overview
This document outlines the complete GCP infrastructure setup for ChatterForms, designed to support HIPAA-compliant form creation, storage, and analytics.

## Project Information
- **Project ID**: `chatterforms` (configurable)
- **Project Name**: ChatterForms
- **Region**: `us-central1` (HIPAA-compliant)
- **Environment**: Development (configurable for production)

## 🏗️ Infrastructure Components

### 1. APIs Enabled

All required APIs have been enabled for the project:

```bash
# APIs that were enabled:
- bigquery.googleapis.com         # BigQuery API
- bigquerystorage.googleapis.com  # BigQuery Storage API
- cloudfunctions.googleapis.com   # Cloud Functions API
- cloudkms.googleapis.com         # Cloud Key Management Service (KMS) API
- dlp.googleapis.com              # Sensitive Data Protection (DLP)
- firestore.googleapis.com        # Cloud Firestore API
- identitytoolkit.googleapis.com  # Identity Toolkit API
- logging.googleapis.com          # Cloud Logging API
- monitoring.googleapis.com       # Cloud Monitoring API
- storage.googleapis.com          # Cloud Storage API
```

### 2. Service Accounts

Three service accounts have been created with specific roles:

#### chatterforms-app@$PROJECT_ID.iam.gserviceaccount.com
- **Display Name**: ChatterForms Application
- **Purpose**: Main application service account
- **Roles**:
  - `roles/datastore.user` - Firestore access
  - `roles/storage.objectViewer` - Read access to Cloud Storage
  - `roles/storage.objectCreator` - Write access to Cloud Storage
  - `roles/bigquery.dataEditor` - Write access to BigQuery
  - `roles/cloudkms.cryptoKeyEncrypterDecrypter` - KMS encryption/decryption

#### chatterforms-analytics@$PROJECT_ID.iam.gserviceaccount.com
- **Display Name**: ChatterForms Analytics
- **Purpose**: BigQuery analytics service account
- **Roles**:
  - `roles/bigquery.dataEditor` - Write access to BigQuery datasets

#### chatterforms-storage@$PROJECT_ID.iam.gserviceaccount.com
- **Display Name**: ChatterForms Storage
- **Purpose**: Cloud Storage management
- **Roles**:
  - `roles/storage.objectAdmin` - Full access to Cloud Storage objects
  - `roles/cloudkms.cryptoKeyEncrypterDecrypter` - KMS encryption/decryption

### 3. Data Storage Infrastructure

#### Firestore Database
- **Database**: `(default)`
- **Location**: `us-central1`
- **Type**: `FIRESTORE_NATIVE`
- **Purpose**: Store form structures, user data, and application state
- **HIPAA Compliance**: ✅ Located in HIPAA-compliant region

#### BigQuery Dataset
- **Dataset**: `$PROJECT_ID:form_submissions`
- **Location**: `US`
- **Purpose**: Analytics and form submission data
- **Tables**: To be created (see TODO section)

#### Cloud Storage Buckets
All buckets are located in `us-central1` for HIPAA compliance:

1. **$PROJECT_ID-submissions-us-central1**
   - **Purpose**: Store form submission data
   - **Access**: HIPAA-compliant storage

2. **$PROJECT_ID-uploads-us-central1**
   - **Purpose**: Store uploaded files (PDFs, images)
   - **Access**: Temporary storage for processing

3. **$PROJECT_ID-backups-us-central1**
   - **Purpose**: Backup storage
   - **Access**: Disaster recovery

#### Cloud KMS (Key Management Service)
- **Key Ring**: `chatterforms-keys`
- **Location**: `us-central1`
- **Keys Created**:
  - `form-data-key` - For general form data encryption
  - `hipaa-data-key` - For HIPAA-compliant data encryption
- **Protection Level**: Software (can be upgraded to HSM for production)
- **Purpose**: Customer-managed encryption keys for HIPAA compliance

#### Cloud Functions
- **Location**: `functions/` directory
- **Functions Created**:
  - `processFormSubmission` - HTTP endpoint for form submissions
  - `onSubmissionCreated` - Firestore trigger for analytics updates
  - `healthCheck` - Health check endpoint
- **Technology**: TypeScript, Firebase Functions v2
- **Purpose**: Serverless form processing with HIPAA compliance

#### Railway Backend Integration
- **Location**: `/Users/namratajha/my-poppler-api/`
- **GCP Client**: `gcp-client.js` - Complete GCP integration module
- **Features**:
  - Firestore operations (form storage, submissions)
  - BigQuery analytics integration
  - Cloud Storage file uploads
  - KMS encryption/decryption
  - HIPAA compliance processing
- **Technology**: Node.js, Express, GCP client libraries
- **Purpose**: Heavy processing with GCP storage and analytics

## 🔐 Security & Compliance

### HIPAA Compliance Features
- ✅ **Data Residency**: All data stored in `us-central1` (US region)
- ✅ **Encryption**: Cloud KMS enabled for customer-managed encryption keys
- ✅ **Access Controls**: IAM roles with principle of least privilege
- ✅ **Audit Logging**: Cloud Logging enabled for compliance monitoring
- ✅ **Data Loss Prevention**: DLP API enabled for sensitive data detection

### Security Best Practices
- Service accounts with minimal required permissions
- Separate service accounts for different functions
- Regional data storage for compliance
- Audit logging enabled

## 📊 Data Architecture

### Firestore Collections (Planned)
```
/users/{userId}
  - profile
  - forms
  - settings

/forms/{formId}
  - metadata
  - structure
  - styling
  - permissions

/submissions/{submissionId}
  - formId
  - data
  - timestamp
  - metadata
```

### BigQuery Tables (Created)
```
form_submissions.submissions
- submission_id: STRING
- form_id: STRING
- user_id: STRING
- submission_data: JSON
- timestamp: TIMESTAMP
- ip_address: STRING
- user_agent: STRING
- is_hipaa: BOOLEAN
- encrypted: BOOLEAN

form_submissions.form_analytics
- form_id: STRING
- form_name: STRING
- created_at: TIMESTAMP
- submissions_count: INTEGER
- last_submission: TIMESTAMP
- is_hipaa: BOOLEAN
- is_published: BOOLEAN
- user_id: STRING
```

## 🚀 Deployment Commands

### Initial Setup Commands
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set project (replace with your project ID)
export PROJECT_ID="chatterforms"
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable firestore.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable cloudkms.googleapis.com
gcloud services enable dlp.googleapis.com

# Create service accounts
gcloud iam service-accounts create chatterforms-app --display-name="ChatterForms Application"
gcloud iam service-accounts create chatterforms-analytics --display-name="ChatterForms Analytics"
gcloud iam service-accounts create chatterforms-storage --display-name="ChatterForms Storage"

# Create Firestore database
gcloud firestore databases create --location=us-central1 --type=firestore-native

# Create BigQuery dataset
bq mk --dataset --location=US $PROJECT_ID:form_submissions

# Create BigQuery tables
bq mk --table $PROJECT_ID:form_submissions.submissions submission_id:STRING,form_id:STRING,user_id:STRING,submission_data:JSON,timestamp:TIMESTAMP,ip_address:STRING,user_agent:STRING,is_hipaa:BOOLEAN,encrypted:BOOLEAN
bq mk --table $PROJECT_ID:form_submissions.form_analytics form_id:STRING,form_name:STRING,created_at:TIMESTAMP,submissions_count:INTEGER,last_submission:TIMESTAMP,is_hipaa:BOOLEAN,is_published:BOOLEAN,user_id:STRING

# Create Cloud Storage buckets
gsutil mb -l us-central1 gs://$PROJECT_ID-submissions-us-central1
gsutil mb -l us-central1 gs://$PROJECT_ID-uploads-us-central1
gsutil mb -l us-central1 gs://$PROJECT_ID-backups-us-central1

# Set IAM permissions
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chatterforms-app@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/datastore.user"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chatterforms-app@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/storage.objectViewer"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chatterforms-analytics@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/bigquery.dataEditor"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chatterforms-storage@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"

# Set up Cloud KMS
gcloud kms keyrings create chatterforms-keys --location=us-central1
gcloud kms keys create form-data-key --keyring=chatterforms-keys --location=us-central1 --purpose=encryption --protection-level=software
gcloud kms keys create hipaa-data-key --keyring=chatterforms-keys --location=us-central1 --purpose=encryption --protection-level=software

# Grant KMS permissions
gcloud kms keyrings add-iam-policy-binding chatterforms-keys --location=us-central1 --member="serviceAccount:chatterforms-app@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudkms.cryptoKeyEncrypterDecrypter"
gcloud kms keyrings add-iam-policy-binding chatterforms-keys --location=us-central1 --member="serviceAccount:chatterforms-storage@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudkms.cryptoKeyEncrypterDecrypter"

# Set up Firebase (Cloud Identity Platform)
npm install -g firebase-tools
firebase login
firebase init --project $PROJECT_ID
# Select: Firestore, Functions, Storage

# Generate service account keys
gcloud iam service-accounts keys create chatterforms-app-key.json --iam-account=chatterforms-app@$PROJECT_ID.iam.gserviceaccount.com
gcloud iam service-accounts keys create chatterforms-analytics-key.json --iam-account=chatterforms-analytics@$PROJECT_ID.iam.gserviceaccount.com
gcloud iam service-accounts keys create chatterforms-storage-key.json --iam-account=chatterforms-storage@$PROJECT_ID.iam.gserviceaccount.com

# Set up Railway-GCP integration
cd /path/to/railway-backend
npm install @google-cloud/firestore @google-cloud/storage @google-cloud/bigquery @google-cloud/kms
cp /path/to/chatterforms/chatterforms-*-key.json .
# Create gcp-client.js module for GCP operations
```

## 📋 TODO / Next Steps

### Immediate Tasks
- [x] Create BigQuery tables with proper schema
- [x] Set up Cloud KMS encryption keys
- [x] Configure Cloud Identity Platform for authentication
- [x] Create environment variables for service account credentials
- [x] Set up Cloud Functions for form processing
- [x] Set up Railway-GCP integration
- [ ] Configure Cloud Logging for audit trails

### Future Enhancements
- [ ] Set up Cloud Monitoring dashboards
- [ ] Configure automated backups
- [ ] Set up Cloud Armor for DDoS protection
- [ ] Implement VPC for network isolation
- [ ] Set up Cloud Build for CI/CD

## 🔧 Environment Variables Needed

The following environment variables will be needed for the application:

```env
# GCP Project
GOOGLE_CLOUD_PROJECT=$PROJECT_ID

# Service Account Keys (to be generated)
GOOGLE_APPLICATION_CREDENTIALS_APP=path/to/chatterforms-app-key.json
GOOGLE_APPLICATION_CREDENTIALS_ANALYTICS=path/to/chatterforms-analytics-key.json
GOOGLE_APPLICATION_CREDENTIALS_STORAGE=path/to/chatterforms-storage-key.json

# Storage Buckets
CLOUD_STORAGE_SUBMISSIONS_BUCKET=$PROJECT_ID-submissions-us-central1
CLOUD_STORAGE_UPLOADS_BUCKET=$PROJECT_ID-uploads-us-central1
CLOUD_STORAGE_BACKUPS_BUCKET=$PROJECT_ID-backups-us-central1

# BigQuery
BIGQUERY_DATASET=form_submissions

# Cloud KMS (created)
CLOUD_KMS_KEY_RING=chatterforms-keys
CLOUD_KMS_ENCRYPTION_KEY=form-data-key
CLOUD_KMS_HIPAA_KEY=hipaa-data-key
CLOUD_KMS_LOCATION=us-central1

# Identity Platform (configured)
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_PROJECT_ID=chatterforms
```

## 📈 Cost Estimation

### Current Free Tier Usage
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **BigQuery**: 1TB query processing/month
- **Cloud Storage**: 5GB storage
- **Cloud Functions**: 2M invocations/month

### Expected Costs (Post Free Tier)
- **Firestore**: ~$0.18/GB/month + $0.06/100K reads + $0.18/100K writes
- **BigQuery**: ~$5/TB query processing
- **Cloud Storage**: ~$0.02/GB/month
- **Cloud Functions**: ~$0.40/M invocations

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor
- Form creation rate
- Submission volume
- Storage usage
- API response times
- Error rates
- Authentication success/failure rates

### Recommended Alerts
- High error rates (>5%)
- Storage usage >80%
- Unusual authentication patterns
- API quota approaching limits

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Review and rotate service account keys
- Monitor and optimize BigQuery queries
- Review Cloud Logging for security events
- Update IAM permissions as needed
- Monitor costs and usage

### Emergency Contacts
- GCP Support: Available through Google Cloud Console
- Project Owner: jha.abhishek@gmail.com

---

**Last Updated**: August 26, 2025
**Version**: 1.0
**Status**: Infrastructure Setup Complete ✅
