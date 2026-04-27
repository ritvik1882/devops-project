pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-app-image'
        IMAGE_TAG = 'latest'
        KUBECONFIG = '/home/ritvik/.kube/config'
        DEPLOYMENT_FILE = '${WORKSPACE}/Deployment.yaml'
        SERVICE_FILE = '${WORKSPACE}/Service.yaml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "✓ Code checked out from GitHub successfully!"
                sh '''
                    echo "Workspace: ${WORKSPACE}"
                    ls -la ${WORKSPACE}
                    test -f ${WORKSPACE}/Deployment.yaml || (echo "Deployment.yaml missing in checked out branch" && exit 1)
                    test -f ${WORKSPACE}/Service.yaml || (echo "Service.yaml missing in checked out branch" && exit 1)
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "🐳 Building Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}..."
                sh '''
                    # Use Jenkins home for docker build to avoid buildx permission issues.
                    DOCKER_BUILDKIT=0 docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

                    # Use ritvik's minikube profile/context so image goes to the live cluster.
                    HOME=/home/ritvik minikube -p minikube image load ${IMAGE_NAME}:${IMAGE_TAG}
                    HOME=/home/ritvik minikube -p minikube image ls | grep ${IMAGE_NAME} || true
                    echo "✓ Docker image built successfully"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "☸️ Deploying to Minikube Kubernetes..."
                sh '''
                    export KUBECONFIG=/home/ritvik/.kube/config
                    kubectl get nodes
                    
                    # Apply deployment
                    kubectl apply -f ${WORKSPACE}/Deployment.yaml
                    
                    # Apply service
                    kubectl apply -f ${WORKSPACE}/Service.yaml
                    
                    # Wait for deployment to be ready
                    kubectl rollout status deployment/blog-app-deployment --timeout=5m
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "🔍 Verifying deployment..."
                sh '''
                    export KUBECONFIG=/home/ritvik/.kube/config
                    
                    echo "========== PODS =========="
                    kubectl get pods -l app=blog-app
                    
                    echo ""
                    echo "========== SERVICE =========="
                    kubectl get service blog-app-service
                    
                    echo ""
                    echo "========== DEPLOYMENT =========="
                    kubectl get deployment blog-app-deployment
                '''
            }
        }
    }

    post {
        success {
            sh '''
                export KUBECONFIG=/home/ritvik/.kube/config
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