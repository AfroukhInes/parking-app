data "aws_eks_cluster" "parking" {
  name = var.eks_cluster_name
}

data "aws_eks_cluster_auth" "parking" {
  name = var.eks_cluster_name
}
