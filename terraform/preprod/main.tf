# Ambiente de Pré-Produção (preprod)

# Definição do provedor do Google Cloud Platform
provider "google" {
  project = "${var.project_name}_preprod"
  region  = var.region
}

# Ativar os serviços essenciais para o Serverless Framework
resource "google_project_service" "cloud_functions" {
  project = "${var.project_name}_preprod"
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = "${var.project_name}_preprod"
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage" {
  project = "${var.project_name}_preprod"
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging" {
  project = "${var.project_name}_preprod"
  service = "logging.googleapis.com"
}

# Definindo um bucket do Cloud Storage para armazenamento do estado do Terraform
resource "google_storage_bucket" "terraform_state_bucket" {
  name     = var.bucket_name
  location = var.bucket_location
}
