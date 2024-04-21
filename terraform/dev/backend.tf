terraform {
  backend "gcs" {
    bucket  = "leviata-api-terraform-state-dev"  # Nome do bucket que você criou
    prefix  = "terraform/state"  # Prefixo opcional para o caminho dentro do bucket
  }
}
