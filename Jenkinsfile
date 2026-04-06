pipeline {
    agent any

    environment {
        // Define environment variables
        IMAGE_NAME = 'devops-blog-app'
        CONTAINER_NAME = 'devops-demo'
        HOST_PORT = '8080'
        CONTAINER_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from source control
                // In a real scenario: checkout scm
                echo "Checking out code..."
            }
        }

        stage('Build') {
            steps {
                // Install backend dependencies (for testing/linting in CI if needed)
                dir('backend') {
                    sh 'npm install'
                }
                echo "Dependencies installed successfully."
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
