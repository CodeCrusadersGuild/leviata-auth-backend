terraform {
  backend "gcs" {
    bucket  = "leviata-api-terraform-state-prod"
    prefix  = "terraform/state"
  }
}
