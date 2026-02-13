# GCP Deployment Guide for Koutuhal Pathways

This guide details the steps to deploy the Koutuhal Pathways backend to Google Cloud Platform using Cloud Run, Cloud SQL, and Cloud Storage.

## Prerequisites

-   Google Cloud SDK (`gcloud`) installed and authenticated.
-   A GCP Project created (e.g., `koutuhal-production`).

## 1. Environment Setup

Set your project ID:
```bash
gcloud config set project koutuhal-production
export PROJECT_ID=koutuhal-production
export REGION=us-central1
```

Enable required APIs:
```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

## 2. Cloud Storage (Technically already done, but for prod:)

Create the production bucket if it doesn't exist:
```bash
gcloud storage buckets create gs://koutuhal-uploads-prod --location=$REGION
```
*Make sure `GCS_BUCKET_NAME` in config matches this.*

## 3. Cloud SQL (PostgreSQL)

Create the instance:
```bash
gcloud sql instances create koutuhal-db-prod \
  --database-version=POSTGRES_15 \
  --cpu=1 \
  --memory=3840MiB \
  --region=$REGION
```

Create the database:
```bash
gcloud sql databases create koutuhal --instance=koutuhal-db-prod
```

Create the user:
```bash
gcloud sql users create koutuhal_user \
  --instance=koutuhal-db-prod \
  --password=YOUR_SECURE_PASSWORD
```

## 4. Secrets Management

Store sensitive data in Secret Manager:

1.  **DB Password**:
    ```bash
    echo -n "YOUR_SECURE_PASSWORD" | gcloud secrets create db-password --data-file=-
    ```
2.  **Secret Key**:
    ```bash
    echo -n "YOUR_GENERATED_SECRET_KEY" | gcloud secrets create app-secret-key --data-file=-
    ```
    *(Generate one using `openssl rand -hex 32`)*

## 5. Service Account & IAM

Create a dedicated service account for the Cloud Run service:
```bash
gcloud iam service-accounts create koutuhal-backend-sa \
  --display-name="Koutuhal Backend Service Account"
```

Grant permissions:
-   **Cloud SQL Client**: To connect to the DB.
    ```bash
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:koutuhal-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
      --role="roles/cloudsql.client"
    ```
-   **Secret Accessor**: To read secrets.
    ```bash
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:koutuhal-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
-   **Storage Object Admin**: To upload/delete files.
    ```bash
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:koutuhal-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
      --role="roles/storage.objectAdmin"
    ```

## 6. Container Registry & Build

Create an Artifact Registry repository:
```bash
gcloud artifacts repositories create koutuhal-repo \
  --repository-format=docker \
  --location=$REGION
```

Build and push the image:
```bash
# Run from the /backend directory
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/koutuhal-repo/backend:latest .
```

## 7. Deploy to Cloud Run

Deploy the service:

```bash
gcloud run deploy koutuhal-api \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/koutuhal-repo/backend:latest \
  --region $REGION \
  --service-account koutuhal-backend-sa@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances $PROJECT_ID:$REGION:koutuhal-db-prod \
  --set-env-vars="POSTGRES_USER=koutuhal_user" \
  --set-env-vars="POSTGRES_DB=koutuhal" \
  --set-env-vars="POSTGRES_SERVER=/cloudsql/$PROJECT_ID:$REGION:koutuhal-db-prod" \
  --set-env-vars="POSTGRES_PORT=5432" \
  --set-env-vars="GCS_BUCKET_NAME=koutuhal-uploads-prod" \
  --set-secrets="POSTGRES_PASSWORD=db-password:latest" \
  --set-secrets="SECRET_KEY=app-secret-key:latest" \
  --allow-unauthenticated
```
*Note: We assume `GOOGLE_APPLICATION_CREDENTIALS` is NOT set when running on Cloud Run with an attached Service Account; the libraries automatically use the attached identity.*

## 8. Database Migrations

You can run migrations as a one-off Cloud Run job:

```bash
gcloud run jobs create migrate-db \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/koutuhal-repo/backend:latest \
  --region $REGION \
  --service-account koutuhal-backend-sa@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances $PROJECT_ID:$REGION:koutuhal-db-prod \
  --set-env-vars="POSTGRES_USER=koutuhal_user" \
  --set-env-vars="POSTGRES_DB=koutuhal" \
  --set-env-vars="POSTGRES_SERVER=/cloudsql/$PROJECT_ID:$REGION:koutuhal-db-prod" \
  --set-env-vars="POSTGRES_PORT=5432" \
  --set-secrets="POSTGRES_PASSWORD=db-password:latest" \
  --command="alembic" \
  --args="upgrade,head"

gcloud run jobs execute migrate-db --region $REGION
```

## 9. Verification

1.  Get the service URL: `gcloud run services describe koutuhal-api --region $REGION --format 'value(status.url)'`
2.  Check Health: `curl https://<YOUR-URL>/api/v1/health`
3.  Test Auth/Uploads using the frontend (point frontend to this new API URL).

## Architecture Summary

-   **Compute**: Cloud Run (Stateless, Autoscaling containers)
-   **Database**: Cloud SQL (Managed PostgreSQL 15)
-   **Storage**: Google Cloud Storage (User uploads)
-   **Security**: IAM Service Accounts + Secret Manager (No hardcoded keys)
