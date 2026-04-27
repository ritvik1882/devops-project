pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-app-image'
        IMAGE_TAG = 'latest'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "✓ Code checked out from GitHub successfully!"
            }
        }

        stage('Docker Build') {
            steps {
                echo "🐳 Building Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}..."
                sh '''
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    minikube image load ${IMAGE_NAME}:${IMAGE_TAG}
                    echo "✓ Docker image built successfully"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "☸️ Deploying to Minikube Kubernetes..."
                sh '''
                    export KUBECONFIG=/var/lib/jenkins/.kube/config
                    
                    # Apply deployment
                    kubectl apply -f Deployment.yaml --insecure-skip-tls-verify || \
                    kubectl apply -f Deployment.yaml
                    
                    # Apply service
                    kubectl apply -f Service.yaml --insecure-skip-tls-verify || \
                    kubectl apply -f Service.yaml
                    
                    # Wait for deployment to be ready
                    kubectl rollout status deployment/blog-app-deployment --timeout=5m --insecure-skip-tls-verify || \
                    kubectl rollout status deployment/blog-app-deployment --timeout=5m
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "🔍 Verifying deployment..."
                sh '''
                    export KUBECONFIG=/var/lib/jenkins/.kube/config
                    
                    echo "========== PODS =========="
                    kubectl get pods -l app=blog-app --insecure-skip-tls-verify || \
                    kubectl get pods -l app=blog-app
                    
                    echo ""
                    echo "========== SERVICE =========="
                    kubectl get service blog-app-service --insecure-skip-tls-verify || \
                    kubectl get service blog-app-service
                    
                    echo ""
                    echo "========== DEPLOYMENT =========="
                    kubectl get deployment blog-app-deployment --insecure-skip-tls-verify || \
                    kubectl get deployment blog-app-deployment
                '''
            }
        }
    }

    post {
        success {
            sh '''
                export KUBECONFIG=/var/lib/jenkins/.kube/config
                echo "✓ Pipeline completed successfully!"
                echo ""
                echo "========== ACCESS YOUR APPLICATION =========="
                echo "NodePort: http://$(minikube ip):30000"
                echo ""
                echo "Run these commands to verify:"
                echo "  kubectl get pods"
                echo "  kubectl get service"
                echo "  minikube service blog-app-service"
            '''
        }
        failure {
            echo "❌ Pipeline failed. Check the logs above for details."
        }
    }
}