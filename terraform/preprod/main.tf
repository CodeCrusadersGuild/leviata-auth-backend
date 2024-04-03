# Ambiente de Pré-produção (preprod)

# Definição do provedor do Google Cloud Platform
provider "google" {
  project = var.project_id
  region  = var.region
}

# Ativar os serviços essenciais para o Serverless Framework
resource "google_project_service" "cloud_functions_preprod" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build_preprod" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage_preprod" {
  project = var.project_id
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging_preprod" {
  project = var.project_id
  service = "logging.googleapis.com"
}

# Definindo um bucket do Cloud Storage para armazenamento do estado do Terraform
resource "google_storage_bucket" "terraform_state_bucket" {
  name     = "terraform-state-bucket-preprod"
  location = var.bucket_location
}
