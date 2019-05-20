# Configure the AWS Provider
variable "aws_region" {
  default = "us-east-1"
}

variable "aws_account" {
  default = "324148959017"
}

variable "gitops_bucket" {
  default = "git-ops-prd"
}

variable "certificate_arn" {
  default = "arn:aws:acm:us-east-1:324148959017:certificate/6168f3c7-b505-4ec0-b254-935be71489e9"
}

variable "cloudwatch_notification" {
  default = "arn:aws:sns:us-east-1:324148959017:devops"
}

variable "tag_resource" {
  default = ""
}

variable "tag_service" {
  default = ""
}

variable "tag_environment" {
  default = ""
}

variable "tag_client" {
  default = ""
}

variable "container_port" {
  default = ""
}

variable "container_memory" {
  default = ""
}

variable "container_memory_reservation" {
  default = ""
}

variable "cluster_name" {
  default = ""
}

variable "desired_containers" {
  default = ""
}

variable "min_containers" {
  default = ""
}

variable "max_containers" {
  default = ""
}

variable "cpu_utilization_alarm" {
  default = ""
}

variable "memory_utilization_alarm" {
  default = ""
}

variable "task_count_alarm" {
  default = ""
}

variable "vpc_id" {
  default = ""
}

variable "health_check" {
  default = ""
}

variable "ingress_cidr_blocks" {
  default = ["0.0.0.0/0"]
}

variable "ingress_ipv6_cidr_blocks" {
  default = ["::/0"]
}

variable "public_subnet_ids" {
  default = []
}

variable "service_repository" {
  default = ""
}

variable "service_repository_tag" {
  default = ""
}
