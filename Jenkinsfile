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
                    set -e
                    # Build once as latest, then add deterministic rollout tags.
                    minikube -p minikube image build -t ${IMAGE_NAME}:latest -t docker.io/library/${IMAGE_NAME}:latest .
                    minikube -p minikube image tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${IMAGE_TAG}
                    minikube -p minikube image tag ${IMAGE_NAME}:latest docker.io/library/${IMAGE_NAME}:${IMAGE_TAG}

                    # Ensure rollout tag exists in the node runtime before deploy.
                    minikube -p minikube image ls | grep -E "${IMAGE_NAME}:latest|${IMAGE_NAME}:${IMAGE_TAG}"
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
                    set -e
                    minikube -p minikube kubectl -- set image deployment/blog-app blog-app=docker.io/library/${IMAGE_NAME}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                    set +e
                    minikube -p minikube kubectl -- rollout status deployment/blog-app -n ${K8S_NAMESPACE} --timeout=240s
                    ROLLOUT_EXIT=$?
                    set -e

                    if [ ${ROLLOUT_EXIT} -ne 0 ]; then
                        echo "Rollout timed out. Collecting diagnostics..."
                        minikube -p minikube kubectl -- get deployment blog-app -n ${K8S_NAMESPACE} -o wide || true
                        minikube -p minikube kubectl -- get rs -n ${K8S_NAMESPACE} || true
                        minikube -p minikube kubectl -- get pods -n ${K8S_NAMESPACE} -l app=blog-app -o wide || true
                        minikube -p minikube kubectl -- describe deployment blog-app -n ${K8S_NAMESPACE} || true
                        POD_NAME=$(minikube -p minikube kubectl -- get pods -n ${K8S_NAMESPACE} -l app=blog-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
                        if [ -n "${POD_NAME}" ]; then
                            minikube -p minikube kubectl -- describe pod "${POD_NAME}" -n ${K8S_NAMESPACE} || true
                            minikube -p minikube kubectl -- get events -n ${K8S_NAMESPACE} --sort-by=.metadata.creationTimestamp | tail -n 30 || true
                        fi

                        echo "Attempting one-time recovery for single-replica rollout..."
                        minikube -p minikube kubectl -- delete pod -n ${K8S_NAMESPACE} -l app=blog-app --force --grace-period=0 || true
                        minikube -p minikube kubectl -- rollout status deployment/blog-app -n ${K8S_NAMESPACE} --timeout=180s
                    fi

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