include ../../../make_variables

variable_files = ../../../account.tfvars ./local.tfvars
config_files = config.tf datablocks.tf variables.tf local.tfvars

role_key = \"terraform/ct/$(INSTANCE)/ct-load-data-role/terraform.tfstate\"\\n

terraform.tfvars: $(variable_files) ../../../make_variables
	cat $(variable_files) > terraform.tfvars
	echo rolekey = $(role_key) >> terraform.tfvars
	echo statebucket = \"$(statebucket)\" >> terraform.tfvars

.PHONY: init
init: terraform.tfvars
	terraform init -reconfigure

.PHONY: plan
plan: terraform.tfvars $(config_files) ../function.zip
	terraform plan

.PHONY: apply
apply: terraform.tfvars $(config_files) ../function.zip
	terraform apply

.PHONY: apply-y
apply-y: terraform.tfvars $(config_files) ../function.zip
	terraform apply -auto-approve

.PHONY: destroy
destroy: terraform.tfvars $(config_files)
	terraform destroy

clean:
	rm -f  terraform.tfvars



