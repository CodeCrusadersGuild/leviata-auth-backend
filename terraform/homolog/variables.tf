variable "homolog_project_id" {
  description = "ID do projeto de homologação"
  type        = string
  default     = "leviata-api-homolog"
}

variable "bucket_name" {
  description = "Nome do bucket do Google Cloud Storage para armazenar os arquivos de estado do Terraform"
  type        = string
  default     = "leviata-api-terraform-state-homolog"
}