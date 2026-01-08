# Terraform Infrastructure

This Terraform configuration documents the AWS infrastructure used by the Parking App.

## Managed Resources
- Amazon EKS cluster (existing)
- Amazon RDS PostgreSQL (existing)
- Default VPC

⚠️ Note:
Infrastructure was initially created using AWS CLI.
Terraform is used here to codify and document the infrastructure for reproducibility.

No `terraform apply` was executed on production resources.
