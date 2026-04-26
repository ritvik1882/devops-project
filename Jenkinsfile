// 7ec0f3a3c9a447359c2ed7c0f904acf5
// http://localhost:8080/
// sudo usermod -aG docker jenkins
// sudo systemctl restart jenkins

pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-app-image'
        CONTAINER_NAME = 'blog-app'
        HOST_PORT = '5000'
        CONTAINER_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out from GitHub successfully!"
            }
        }

        stage('Docker Build') {
            steps {
                // Build the Docker image
                echo "Building Docker Image: ${IMAGE_NAME}..."
                sh 'docker build -t ${IMAGE_NAME} .'
            }
        }

        stage('Docker Run / Deploy') {
            steps {
                // Stop and remove existing container if it exists
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                '''
                
                // Run the new container
                echo "Running new container on port ${HOST_PORT}..."
                sh 'docker run -d -p ${HOST_PORT}:${CONTAINER_PORT} --name ${CONTAINER_NAME} ${IMAGE_NAME}'
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully! Application is running on http://localhost:${HOST_PORT}"
        }
        failure {
            echo "Pipeline failed. Check the logs for details."
        }
    }
}