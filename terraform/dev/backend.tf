terraform {
  backend "gcs" {
    bucket  = "leviata-api-terraform-state-dev"
    prefix  = "terraform/state"
  }
}
