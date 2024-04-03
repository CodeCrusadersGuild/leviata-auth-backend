variable "region" {
  type    = string
  default = "us-central1"
}

variable "project_name" {
  type    = string
  default = "app-leviata-api"
}

variable "cloud_functions_name" {
  type    = string
  default = "cloud_functions"
}

variable "cloud_build_name" {
  type    = string
  default = "cloud_build"
}

variable "cloud_storage_name" {
  type    = string
  default = "cloud_storage"
}

variable "cloud_logging_name" {
  type    = string
  default = "cloud_logging"
}

variable "bucket_location" {
  type    = string
  default = "us-central1"
}

variable "bucket_name" {
  type    = string
  default = "terraform-state-bucket"
}