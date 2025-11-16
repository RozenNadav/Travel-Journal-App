provider "aws" {
    region = "us-east-1"
}

resource "aws_db_instance" "postgres_db" {
    allocated_storage      = 20
    engine                 = "postgres"
    engine_version         = "17.7"
    instance_class         = "db.t3.micro"
    name                   = "mydatabase"
    username               = "var.db_username"
    password               = var.db_password # Use a variable for sensitive data
    parameter_group_name   = "default.postgres14"
    skip_final_snapshot    = true
    vpc_security_group_ids = [aws_security_group.rds_sg.id]
    db_subnet_group_name   = aws_db_subnet_group.default.name
}

resource "aws_security_group" "rds_sg" {
  # ... Define ingress rules to allow access from EKS or other necessary sources
}

resource "aws_db_subnet_group" "default" {
  # ... Define subnets for RDS
}
