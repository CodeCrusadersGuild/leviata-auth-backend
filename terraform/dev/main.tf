provider "google" {
  project = var.dev_project_id
  region  = "us-central1"
}

resource "google_project_service" "cloud_resource_manager" {
  project = var.dev_project_id
  service = "cloudresourcemanager.googleapis.com"
}

# Crie o bucket no Google Cloud Storage para armazenar os arquivos de estado do ambiente de desenvolvimento
resource "google_storage_bucket" "leviata_api_terraform_state_dev" {
  name     = "leviata-api-terraform-state-dev"
  location = "US" # Defina a localização desejada para o bucket (por exemplo, "US" para os EUA)

  # Adicione outras configurações do bucket, se necessário
}

resource "google_project_service" "cloud_functions" {
  project = var.dev_project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = var.dev_project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_logging" {
  project = var.dev_project_id
  service = "logging.googleapis.com"
}
