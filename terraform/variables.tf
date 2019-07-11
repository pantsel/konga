variable "aws_region" {
  default = ""
}

variable "aws_account" {
  default = ""
}

variable "gitops_bucket" {
  default = ""
}

variable "gitops_region" {
  default = ""
}

variable "certificate_arn" {
  default = ""
}

variable "cloudwatch_notification" {
  default = ""
}

variable "tag_name" {
  default = ""
}

variable "tag_resource" {
  default = ""
}

variable "tag_client" {
  default = ""
}

variable "tag_environment" {
  default = ""
}

variable "task_revision" {
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

variable "internal" {
  default = ""
}

variable "public_subnet_ids" {
  default = []
}
