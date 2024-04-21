variable "preprod_project_id" {
  description = "ID do projeto de pre-produção"
  type        = string
  default     = "leviata-api-preprod"
}

variable "bucket_name" {
  description = "Nome do bucket do Google Cloud Storage para armazenar os arquivos de estado do Terraform"
  type        = string
  default     = "leviata-api-terraform-state-preprod"
}