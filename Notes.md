# To Do
- Add test in loader to verify filename has right format and hasn't been loaded before
- Finish checking pct length change.
- Add check of file glob
- How are we going to do error notificaiton?
- Work out logic for the SFTP download - how do we generate name for Bedrock to download?
- Add a readme in the src directory or top level on building
- Figure out how we're going to monitor all this!


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


