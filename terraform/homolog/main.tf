# Ambiente de Homologação (homolog)

# Definição do provedor do Google Cloud Platform
provider "google" {
  project = var.project_id
  region  = var.region
}

# Ativar os serviços essenciais para o Serverless Framework
resource "google_project_service" "cloud_functions_homolog" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "cloud_build_homolog" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_storage_homolog" {
  project = var.project_id
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloud_logging_homolog" {
  project = var.project_id
  service = "logging.googleapis.com"
}
