variable "dev_project_id" {
  description = "ID do projeto de desenvolvimento"
  type        = string
  default     = "leviata-api-dev-421000"
}

variable "bucket_name" {
  description = "Nome do bucket do Google Cloud Storage para armazenar os arquivos de estado do Terraform"
  type        = string
  default     = "leviata-api-terraform-state-dev"
}

variable "firebase_name" {
  description = "O nome do projeto Firebase."
  type        = string
  default     = "leviata-firebase-dev"
}
