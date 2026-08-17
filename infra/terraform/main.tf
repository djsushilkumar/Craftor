# Craftor Production 1.0 Global Infrastructure Terraform Plan
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare DNS Zone ID for craftor.ai"
  default     = "cf_zone_craftor_prod"
}

variable "environment" {
  type    = string
  default = "production"
}

resource "cloudflare_worker_script" "craftor_edge_gateway" {
  name    = "craftor-edge-gateway-${var.environment}"
  content = file("${path.module}/../../packages/edge-runtime/dist/index.js")
}

resource "cloudflare_worker_route" "craftor_edge_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.craftor.ai/mcp/*"
  script_name = cloudflare_worker_script.craftor_edge_gateway.name
}
