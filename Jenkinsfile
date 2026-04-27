// 7ec0f3a3c9a447359c2ed7c0f904acf5
// http://localhost:8080/
// sudo usermod -aG docker jenkins
// sudo systemctl restart jenkins

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE_NAME = 'blog-app-image'
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = 'default'
        MINIKUBE_HOME = '/var/lib/jenkins/.minikube'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out from GitHub successfully!"
            }
        }

        stage('Minikube Preflight') {
            steps {
                echo "Checking Minikube status and Kubernetes access..."
                sh '''
                    mkdir -p ${MINIKUBE_HOME}
                    minikube -p minikube status || minikube -p minikube start --driver=docker
                    minikube -p minikube kubectl -- get nodes
                '''
            }
        }

        stage('Docker Build (Minikube Image Build)') {
            steps {
                echo "Building Docker image directly in Minikube..."
                sh '''
                    minikube -p minikube image build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .
                    minikube -p minikube image ls | grep ${IMAGE_NAME}
                '''
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                echo "Applying Kubernetes manifests..."
                sh '''
                    minikube -p minikube kubectl -- apply -f Deployment.yaml -n ${K8S_NAMESPACE}
                    minikube -p minikube kubectl -- apply -f Service.yaml -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Update Image & Verify Rollout') {
            steps {
                echo "Updating deployment image and verifying rollout..."
                sh '''
                    minikube -p minikube kubectl -- set image deployment/blog-app blog-app=${IMAGE_NAME}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                    minikube -p minikube kubectl -- rollout status deployment/blog-app -n ${K8S_NAMESPACE} --timeout=180s
                    minikube -p minikube kubectl -- get pods -n ${K8S_NAMESPACE}
                    minikube -p minikube kubectl -- get services -n ${K8S_NAMESPACE}
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