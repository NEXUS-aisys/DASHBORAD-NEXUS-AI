#!/bin/bash

# Phase 5: Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, and Alertmanager to the Kubernetes cluster.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
K8S_DIR="../k8s"
MONITORING_NAMESPACE="monitoring"

echo -e "${BLUE}🚀 NexusTradeAI Monitoring Stack Deployment - Phase 5${NC}"
echo "========================================================"

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
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Deploy monitoring stack
deploy_monitoring_stack() {
    echo -e "${BLUE}☸️  Deploying Monitoring Stack...${NC}"
    
    # Create monitoring namespace
    kubectl apply -f "${K8S_DIR}/monitoring-namespace.yaml"
    print_status "Monitoring namespace created"
    
    # Deploy Prometheus
    kubectl apply -f "${K8S_DIR}/prometheus-rbac.yaml"
    kubectl apply -f "${K8S_DIR}/prometheus-configmap.yaml"
    kubectl apply -f "${K8S_DIR}/prometheus-deployment.yaml"
    print_status "Prometheus deployed"
    
    # Deploy Grafana
    kubectl apply -f "${K8S_DIR}/grafana-configmap.yaml"
    kubectl apply -f "${K8S_DIR}/grafana-deployment.yaml"
    print_status "Grafana deployed"
    
    # Deploy Alertmanager
    kubectl apply -f "${K8S_DIR}/alertmanager-configmap.yaml"
    kubectl apply -f "${K8S_DIR}/alertmanager-deployment.yaml"
    print_status "Alertmanager deployed"
}

# Port-forward to services
port_forward_services() {
    echo -e "${BLUE}🔗 Port-forwarding services...${NC}"
    
    echo -e "${YELLOW}To access the services, run the following commands in separate terminals:${NC}"
    echo "kubectl port-forward -n ${MONITORING_NAMESPACE} svc/prometheus-service 9090:9090"
    echo "kubectl port-forward -n ${MONITORING_NAMESPACE} svc/grafana-service 3000:3000"
    echo "kubectl port-forward -n ${MONITORING_NAMESPACE} svc/alertmanager-service 9093:9093"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting monitoring stack deployment process...${NC}"
    
    check_prerequisites
    deploy_monitoring_stack
    port_forward_services
    
    echo ""
    echo -e "${GREEN}🎉 Monitoring Stack Deployment Completed Successfully!${NC}"
    echo "=============================================================="
    echo ""
    echo -e "${BLUE}📊 Access URLs:${NC}"
    echo "• Prometheus: http://localhost:9090"
    echo "• Grafana: http://localhost:3000 (admin/admin)"
    echo "• Alertmanager: http://localhost:9093"
    echo ""
    echo -e "${BLUE}🔧 Next Steps:${NC}"
    echo "1. Open the port-forwarding commands in separate terminals."
    echo "2. Access the Grafana UI and configure your dashboards."
    echo "3. Configure the Alertmanager Slack webhook in 'alertmanager-configmap.yaml'."
    echo "4. Add alerting rules to 'prometheus-configmap.yaml'."
}

# Run main function
main "$@"