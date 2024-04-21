terraform {
  backend "gcs" {
    bucket  = "leviata-api-terraform-state-homolog"
    prefix  = "terraform/state"
  }
}
