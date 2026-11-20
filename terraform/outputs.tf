output "app_url" {
  description = "Public HTTPS URL of the application."
  value       = "https://${local.app_domain}"
}

output "api_health_url" {
  description = "API health endpoint."
  value       = "https://${local.app_domain}/api/health"
}

output "public_ip" {
  description = "Elastic IP attached to the app host."
  value       = aws_eip.app.public_ip
}

output "instance_id" {
  description = "EC2 instance ID (use with: aws ssm start-session --target <id>)."
  value       = aws_instance.app.id
}
