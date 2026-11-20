locals {
  name         = "${var.project_name}-${var.environment}"
  server_image = "${var.image_prefix}-server:${var.image_tag}"
  client_image = "${var.image_prefix}-client:${var.image_tag}"
  app_domain   = var.domain_name != "" ? var.domain_name : "${replace(aws_eip.app.public_ip, ".", "-")}.sslip.io"
}

# ---------------------------------------------------------------------------
# Networking: default VPC + security group
# ---------------------------------------------------------------------------

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "app" {
  name        = "${local.name}-app"
  description = "Finbit web traffic"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "${local.name}-app"
  }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.app.id
  description       = "HTTP (ACME challenge + redirect to HTTPS)"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.app.id
  description       = "HTTPS"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "https_quic" {
  security_group_id = aws_security_group.app.id
  description       = "HTTP/3"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "udp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  for_each = toset(var.ssh_ingress_cidrs)

  security_group_id = aws_security_group.app.id
  description       = "SSH"
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.app.id
  description       = "All outbound"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ---------------------------------------------------------------------------
# IAM: instance role for SSM (used by the CI deploy job and Session Manager)
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "${local.name}-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "app" {
  name = "${local.name}-ec2"
  role = aws_iam_role.app.name
}

# ---------------------------------------------------------------------------
# Application secrets (stored in Terraform state — keep the state bucket private)
# ---------------------------------------------------------------------------

resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}

# ---------------------------------------------------------------------------
# Compute: Ubuntu 24.04 host running the Docker Compose stack
# ---------------------------------------------------------------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720112718"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# The Elastic IP is created first so its address can be baked into the app domain.
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "${local.name}-app"
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.app.name
  key_name               = var.ssh_key_name

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    compose_file       = file("${path.module}/../deploy/docker-compose.prod.yml")
    caddyfile          = file("${path.module}/../deploy/Caddyfile")
    server_image       = local.server_image
    client_image       = local.client_image
    app_domain         = local.app_domain
    elastic_ip         = aws_eip.app.public_ip
    mongo_uri          = var.mongo_uri
    jwt_secret         = random_password.jwt_access.result
    jwt_refresh_secret = random_password.jwt_refresh.result
  })

  metadata_options {
    http_tokens = "required" # IMDSv2 only
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_size
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-app"
  }

  lifecycle {
    # user_data only runs on first boot; app updates are rolled out by CI over SSM.
    # Force a rebuild with: terraform apply -replace=aws_instance.app
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
