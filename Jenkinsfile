pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ines234"
        BACKEND_IMAGE  = "ines234/parking-backend"
        FRONTEND_IMAGE = "ines234/parking-frontend"
        NAMESPACE = "parking"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/AfroukhInes/parking-app.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE:latest ./parking-backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $FRONTEND_IMAGE:latest ./parking-frontend'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    docker push $BACKEND_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                kubectl set image deployment/parking-backend parking-backend=$BACKEND_IMAGE:latest -n $NAMESPACE
                kubectl set image deployment/parking-frontend parking-frontend=$FRONTEND_IMAGE:latest -n $NAMESPACE
                '''
            }
        }
    }
}
