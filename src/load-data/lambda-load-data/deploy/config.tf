provider "aws" {
  region	= var.region
}

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
}

output "load_data_fn_arn" {
  value = "${aws_lambda_function.load_data_fn-$$INSTANCE$$.arn}"
}