terraform {
  backend "gcs" {
    bucket  = "leviata-api-terraform-state-preprod"
    prefix  = "terraform/state"
  }
}
