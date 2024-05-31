terraform {
  backend "s3" {
    region = $$region$$
    bucket = $$statebucket$$
    key = "terraform/ct/$$INSTANCE$$/testing/ct-db/terraform.tfstate"
  }
}