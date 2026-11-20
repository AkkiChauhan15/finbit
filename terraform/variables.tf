variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix used for resources and tags."
  type        = string
  default     = "finbit"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type. t3.small (2 GiB) comfortably runs MongoDB + API + web."
  type        = string
  default     = "t3.small"
}

variable "root_volume_size" {
  description = "Root EBS volume size in GiB (also holds MongoDB data)."
  type        = number
  default     = 20
}

variable "image_prefix" {
  description = "Container image prefix; '-server' and '-client' are appended."
  type        = string
  default     = "ghcr.io/ai-man-codes/finbit"
}

variable "image_tag" {
  description = "Container image tag pulled on first boot. CI redeploys newer images afterwards."
  type        = string
  default     = "latest"
}

variable "domain_name" {
  description = "Public hostname for the app. Leave empty to use <elastic-ip>.sslip.io (auto HTTPS via Caddy)."
  type        = string
  default     = ""
}

variable "mongo_uri" {
  description = "Optional external MongoDB URI (e.g. Atlas). Empty uses the MongoDB container on the instance."
  type        = string
  default     = ""
  sensitive   = true
}

variable "ssh_key_name" {
  description = "Optional EC2 key pair name for SSH. Access via SSM Session Manager works without it."
  type        = string
  default     = null
}

variable "ssh_ingress_cidrs" {
  description = "CIDRs allowed to reach port 22. Empty list keeps SSH closed."
  type        = list(string)
  default     = []
}
