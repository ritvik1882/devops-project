// start docker desktop
// minikube start --driver=docker

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
                echo "Code checked out from GitHub successfully!"
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
                echo "Building Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}..."
                sh '''
                    DOCKER_BUILDKIT=0 docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    HOME=/home/ritvik minikube -p minikube image load ${IMAGE_NAME}:${IMAGE_TAG}
                   =/home/ritvik minikube -p minikube image ls | grep ${IMAGE_NAME} || true
                    echo "Docker image built successfully"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Minikube Kubernetes..."
                sh '''
                    export KUBECONFIG=/home/ritvik/.kube/config
                    kubectl get nodes
                    
                    kubectl apply -f ${WORKSPACE}/PersistentVolumeClaim.yaml
                    kubectl apply -f ${WORKSPACE}/Deployment.yaml
                    kubectl apply -f ${WORKSPACE}/Service.yaml
                    
                    kubectl rollout status deployment/blog-app-deployment --timeout=3m
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "Verifying deployment..."
                sh '''
                    export KUBECONFIG=/home/ritvik/.kube/config
                    
                    echo "== PODS =="
                    kubectl get pods -l app=blog-app
                    
                    echo "\n== SERVICE =="
                    kubectl get service blog-app-service
                    
                    echo "\n== DEPLOYMENT =="
                    kubectl get deployment blog-app-deployment
                '''
            }
        }
    }

    post {
        success {
            sh '''
                export KUBECONFIG=/home/ritvik/.kube/config
                echo "Pipeline completed successfully!"
            '''
        }
        failure {
            echo "Pipeline failed."
        }
    }
}

// Verify and run:
// kubectl get pods
// kubectl get service
// kubectl port-forward service/blog-app-service 8000:80