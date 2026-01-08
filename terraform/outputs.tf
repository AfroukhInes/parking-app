output "eks_cluster_endpoint" {
  value = data.aws_eks_cluster.parking.endpoint
}

output "rds_endpoint" {
  value = data.aws_db_instance.parking.address
}

output "rds_port" {
  value = data.aws_db_instance.parking.port
}
