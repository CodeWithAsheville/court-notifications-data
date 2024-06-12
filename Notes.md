# To Do
- Add a readme in the src directory or top level on building
- Work through the logic for processing new files from S3:
    - Create a trigger for the lambda function from the courtdates.org S3 bucket (datafiles/*)
    - Probably should keep a record of loads (file name, date, length)
    - load to a side table
    - work out the logic for swapping in the new data
- Work through the logic for the SFTP download - need to know what file name to look for.
- Figure out how we're going to monitor all this!
- Upgrade the main court reminders database (per [this email](https://mail.google.com/mail/u/0/#inbox/WhctKKZWnmmLCVGRxvpfWCPwWNdKKdrdccMCfgHlNkTPmJbDRlQtXpSCRBPcJwXgPpJrkRg) and following [these instructions](https://devcenter.heroku.com/articles/upgrading-heroku-postgres-databases)). Do on the staging server first, obviously. Requires about 30 min downtime.


# Creating the EC2 instance for running the sftp download from Buncombe County

1. sudo yum update -y
2. sudo yum install -y make
3. sudo yum install -y git
4. curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
5. nvm install 20
NOTE: leaving python, which is at 3.9
Created a court-agent role (for now with admin access) and attached it to the EC2

# Future Note
I deleted the VPC configuration information for the load-data lambda because I wasn't able to get it to access the S3 bucket. In case we want to restore that later, here's the original code in src/load-data/lambda-load-data/deploy/config.tf:
```
resource "aws_lambda_function" "load_data_fn-$$INSTANCE$$" {
    description      = "Function to load AOC court dates data" 
    filename        = "../function.zip"
    function_name   = "load_data_fn-$$INSTANCE$$"
    role            = data.terraform_remote_state.ct-load-data-role.outputs.load_data_role_arn
    handler         = "handler.lambda_handler"
    runtime         = "nodejs20.x"
    source_code_hash = filebase64sha256("../function.zip")
    timeout         = 900
    memory_size     = 256
    vpc_config {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
}
```


