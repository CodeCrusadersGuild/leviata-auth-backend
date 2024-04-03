# Ambiente de Produção (prod)

# Definição do provedor do Google Cloud Platform
provider "google" {
  project = var.project_id
  region  = var.region
}

# Ativar os serviços essenciais para o Serverless Framework
resource "google_project_service" "cloud_functions_prod" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build_prod" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage_prod" {
  project = var.project_id
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging_prod" {
  project = var.project_id
  service = "logging.googleapis.com"
}

# Definindo um bucket do Cloud Storage para armazenamento do estado do Terraform
resource "google_storage_bucket" "terraform_state_bucket" {
  name     = "terraform-state-bucket-prod"
  location = var.bucket_location
}
