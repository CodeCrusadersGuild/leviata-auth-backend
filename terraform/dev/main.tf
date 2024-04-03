# Ambiente de Desenvolvimento (dev)

# Definição do provedor do Google Cloud Platform
provider "google" {
  project = var.project_id
  region  = var.region
}

# Ativar os serviços essenciais para o Serverless Framework
resource "google_project_service" "cloud_functions" {
  project = "${var.project_name}_dev"
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = "${var.project_name}_dev"
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage" {
  project = "${var.project_name}_dev"
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging" {
  project = "${var.project_name}_dev"
  service = "logging.googleapis.com"
}

# Definindo um bucket do Cloud Storage para armazenamento do estado do Terraform
resource "google_storage_bucket" "terraform_state_bucket" {
  name     = var.bucket_name
  location = var.bucket_location
}

# Definindo a saída para o nome do bucket
output "bucket_name" {
  value = google_storage_bucket.terraform_state_bucket.name
}
