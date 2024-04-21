provider "google" {
  project = var.preprod_project_id
  region  = "us-central1"
}

resource "google_project_service" "cloud_resource_manager" {
  project = var.preprod_project_id
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_storage_bucket" "leviata_api_terraform_state_preprod" {
  name     = var.bucket_name
  location = "US"
}

resource "google_project_service" "cloud_functions" {
  project = var.preprod_project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = var.preprod_project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "deployment_manager" {
  project = var.preprod_project_id
  service = "deploymentmanager.googleapis.com"
}

resource "google_project_service" "cloud_logging" {
  project = var.preprod_project_id
  service = "logging.googleapis.com"
}
