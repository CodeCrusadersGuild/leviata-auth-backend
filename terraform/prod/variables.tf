variable "prod_project_id" {
  description = "ID do projeto de produção"
  type        = string
  default     = "leviata-api-prod"
}

variable "bucket_name" {
  description = "Nome do bucket do Google Cloud Storage para armazenar os arquivos de estado do Terraform"
  type        = string
  default     = "leviata-api-terraform-state-prod"
}