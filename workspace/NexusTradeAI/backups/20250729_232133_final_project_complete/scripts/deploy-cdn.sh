#!/bin/bash

# Phase 4.2: CDN Deployment Script
# Global Static Asset Distribution for NexusTradeAI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="nexustrade-ai"
S3_BUCKET="nexustrade-ai-static"
CLOUDFRONT_COMMENT="NexusTradeAI Global CDN Distribution"
REGION="us-east-1"
CLIENT_DIR="../client"
DIST_DIR="$CLIENT_DIR/dist"

echo -e "${BLUE}🚀 NexusTradeAI CDN Deployment - Phase 4.2${NC}"
echo "================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if build exists
    if [ ! -d "$DIST_DIR" ]; then
        print_warning "Build directory not found. Running production build..."
        cd "$CLIENT_DIR"
        npm run build:production
        cd - > /dev/null
    fi
    
    print_status "Prerequisites check completed"
}

# Create S3 bucket
create_s3_bucket() {
    echo -e "${BLUE}🪣 Creating S3 bucket for static assets...${NC}"
    
    # Create bucket
    if aws s3 mb "s3://$S3_BUCKET" --region "$REGION" 2>/dev/null; then
        print_status "S3 bucket created: $S3_BUCKET"
    else
        print_warning "S3 bucket already exists or creation failed"
    fi
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_BUCKET" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$S3_BUCKET" \
        --policy file:///tmp/bucket-policy.json
    
    # Configure CORS
    cat > /tmp/cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "https://nexustradeai.com",
        "https://www.nexustradeai.com",
        "https://cdn.nexustradeai.com"
      ],
      "MaxAgeSeconds": 86400
    }
  ]
}
EOF
    
    aws s3api put-bucket-cors \
        --bucket "$S3_BUCKET" \
        --cors-configuration file:///tmp/cors.json
    
    print_status "S3 bucket configured for static hosting"
}

# Upload assets to S3
sync_assets_to_s3() {
    echo -e "${BLUE}📤 Syncing assets to S3...${NC}"
    
    # Sync static assets with long cache headers
    aws s3 sync "$DIST_DIR/" "s3://$S3_BUCKET/" \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "index.html" \
        --exclude "*.html" \
        --metadata-directive REPLACE
    
    # Sync HTML files with no cache
    aws s3 sync "$DIST_DIR/" "s3://$S3_BUCKET/" \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "*.html" \
        --metadata-directive REPLACE
    
    print_status "Assets synchronized to S3"
}

# Create CloudFront distribution
create_cloudfront_distribution() {
    echo -e "${BLUE}☁️  Creating CloudFront distribution...${NC}"
    
    # Create distribution configuration
    cat > /tmp/distribution-config.json << EOF
{
  "CallerReference": "$PROJECT_NAME-$(date +%s)",
  "Comment": "$CLOUDFRONT_COMMENT",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "$S3_BUCKET-origin",
        "DomainName": "$S3_BUCKET.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "$S3_BUCKET-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 3,
    "Items": [
      {
        "PathPattern": "/assets/*",
        "TargetOriginId": "$S3_BUCKET-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
          "Enabled": false,
          "Quantity": 0
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 31536000,
        "DefaultTTL": 31536000,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "*.js",
        "TargetOriginId": "$S3_BUCKET-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
          "Enabled": false,
          "Quantity": 0
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 86400,
        "DefaultTTL": 86400,
        "MaxTTL": 2592000,
        "Compress": true
      },
      {
        "PathPattern": "*.css",
        "TargetOriginId": "$S3_BUCKET-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
          "Enabled": false,
          "Quantity": 0
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 86400,
        "DefaultTTL": 86400,
        "MaxTTL": 2592000,
        "Compress": true
      }
    ]
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_All",
  "HttpVersion": "http2",
  "IsIPV6Enabled": true
}
EOF
    
    # Create CloudFront distribution
    DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/distribution-config.json)
    
    DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Distribution.Id')
    DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Distribution.DomainName')
    
    print_status "CloudFront distribution created"
    echo "  Distribution ID: $DISTRIBUTION_ID"
    echo "  Domain Name: $DISTRIBUTION_DOMAIN"
    
    # Save distribution info
    echo "DISTRIBUTION_ID=$DISTRIBUTION_ID" > /tmp/cdn-info.env
    echo "DISTRIBUTION_DOMAIN=$DISTRIBUTION_DOMAIN" >> /tmp/cdn-info.env
    echo "S3_BUCKET=$S3_BUCKET" >> /tmp/cdn-info.env
}

# Create Kubernetes secret for AWS credentials
create_k8s_secret() {
    echo -e "${BLUE}🔐 Creating Kubernetes secret for AWS credentials...${NC}"
    
    # Get AWS credentials
    AWS_ACCESS_KEY=$(aws configure get aws_access_key_id)
    AWS_SECRET_KEY=$(aws configure get aws_secret_access_key)
    
    if [ -z "$AWS_ACCESS_KEY" ] || [ -z "$AWS_SECRET_KEY" ]; then
        print_error "AWS credentials not found in configuration"
        exit 1
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$PROJECT_NAME" --dry-run=client -o yaml | kubectl apply -f -
    
    # Create secret
    kubectl create secret generic aws-credentials \
        --from-literal=access-key-id="$AWS_ACCESS_KEY" \
        --from-literal=secret-access-key="$AWS_SECRET_KEY" \
        --namespace="$PROJECT_NAME" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_status "AWS credentials secret created in Kubernetes"
}

# Deploy CDN Kubernetes resources
deploy_k8s_resources() {
    echo -e "${BLUE}☸️  Deploying CDN Kubernetes resources...${NC}"
    
    # Apply CDN deployment configuration
    kubectl apply -f ../cdn-deployment.yml
    
    print_status "CDN Kubernetes resources deployed"
}

# Generate performance test
generate_performance_test() {
    echo -e "${BLUE}🏃 Generating performance test...${NC}"
    
    cat > /tmp/cdn-performance-test.sh << 'EOF'
#!/bin/bash

# CDN Performance Test Script
echo "🚀 Testing CDN Performance..."

# Test URLs
DIRECT_URL="https://your-app-domain.com"
CDN_URL="https://your-cdn-domain.cloudfront.net"

# Test function
test_performance() {
    local url=$1
    local name=$2
    
    echo "Testing $name..."
    curl -o /dev/null -s -w "Connect: %{time_connect}s, Start Transfer: %{time_starttransfer}s, Total: %{time_total}s, Size: %{size_download} bytes\n" "$url"
}

echo "📊 Performance Comparison:"
echo "========================="

test_performance "$DIRECT_URL" "Direct Server"
test_performance "$CDN_URL" "CDN"

echo ""
echo "🌍 Global CDN Edge Locations Test:"
echo "=================================="

# Test from different regions (requires external service)
echo "Use tools like GTmetrix, Pingdom, or WebPageTest for comprehensive global testing"
EOF
    
    chmod +x /tmp/cdn-performance-test.sh
    print_status "Performance test script generated at /tmp/cdn-performance-test.sh"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting CDN deployment process...${NC}"
    
    check_prerequisites
    create_s3_bucket
    sync_assets_to_s3
    create_cloudfront_distribution
    create_k8s_secret
    deploy_k8s_resources
    generate_performance_test
    
    echo ""
    echo -e "${GREEN}🎉 CDN Deployment Completed Successfully!${NC}"
    echo "=============================================="
    echo ""
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo "• S3 Bucket: $S3_BUCKET"
    echo "• CloudFront Distribution ID: $DISTRIBUTION_ID"
    echo "• CloudFront Domain: $DISTRIBUTION_DOMAIN"
    echo ""
    echo -e "${BLUE}📈 Expected Performance Improvements:${NC}"
    echo "• Global load times: 40-80% faster"
    echo "• Server bandwidth: 80-90% reduction"
    echo "• Cache hit rate: >90% for static assets"
    echo ""
    echo -e "${BLUE}🔧 Next Steps:${NC}"
    echo "1. Update DNS records to point to CDN domain"
    echo "2. Configure SSL certificates for custom domains"
    echo "3. Run performance tests using /tmp/cdn-performance-test.sh"
    echo "4. Monitor CloudFront metrics and cache hit rates"
    echo ""
    echo -e "${YELLOW}⚠️  Note: CloudFront distribution deployment can take 15-20 minutes to complete globally${NC}"
}

# Run main function
main "$@"