// 7ec0f3a3c9a447359c2ed7c0f904acf5
// http://localhost:8080/
// sudo usermod -aG docker jenkins
// sudo systemctl restart jenkins

pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-app-image'
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out from GitHub successfully!"
            }
        }

        stage('Docker Build (Minikube Docker Daemon)') {
            steps {
                echo "Building Docker image in Minikube Docker daemon..."
                sh '''
                    eval $(minikube -p minikube docker-env)
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .
                    docker images | grep ${IMAGE_NAME}
                '''
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                echo "Applying Kubernetes manifests..."
                sh '''
                    kubectl apply -f Deployment.yaml -n ${K8S_NAMESPACE}
                    kubectl apply -f Service.yaml -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Update Image & Verify Rollout') {
            steps {
                echo "Updating deployment image and verifying rollout..."
                sh '''
                    kubectl set image deployment/blog-app blog-app=${IMAGE_NAME}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/blog-app -n ${K8S_NAMESPACE} --timeout=180s
                    kubectl get pods -n ${K8S_NAMESPACE}
                    kubectl get services -n ${K8S_NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully!"
            echo "Validate with: kubectl get pods && kubectl get services"
            echo "Open app URL with: minikube service blog-app-service --url"
        }
        failure {
            echo "Pipeline failed. Check the logs for details."
        }
    }
}