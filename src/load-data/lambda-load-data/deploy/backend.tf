terraform { 
  backend "s3" {
    region = $$region$$
    bucket = $$statebucket$$
    key = "terraform/ct/$$INSTANCE$$/ct-lambda-load-data/terraform.tfstate"
  }
}
