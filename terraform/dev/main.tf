provider "google" {
  project = var.dev_project_id
  region  = "us-central1"
  zone    = "us-central1-a"
}

resource "google_project" "leviata_api_project" {
  name            = var.dev_project_name
  project_id      = var.dev_project_id
}

resource "google_project_service" "cloud_functions" {
  project = google_project.leviata_api_project.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = google_project.leviata_api_project.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage" {
  project = google_project.leviata_api_project.project_id
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging" {
  project = google_project.leviata_api_project.project_id
  service = "logging.googleapis.com"
}
