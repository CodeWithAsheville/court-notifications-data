data "terraform_remote_state" "ct-load-data-role" {
  backend = "s3"
  config = {
    bucket = var.statebucket
    key = var.rolekey
    region = var.region
  }
}
