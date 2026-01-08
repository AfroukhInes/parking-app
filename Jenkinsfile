pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "ines234/parking-backend"
        FRONTEND_IMAGE = "ines234/parking-frontend"
        NAMESPACE = "parking"
    }

    stages {

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE:latest parking-backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $FRONTEND_IMAGE:latest parking-frontend'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
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
