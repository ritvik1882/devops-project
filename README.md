# DevOps Project - Review 2 Setup (Kubernetes)

This project is configured for Review-2 flow:

Git -> Jenkins -> Docker -> Kubernetes (Minikube)

## Prerequisites

- Docker
- Minikube
- kubectl
- Jenkins with Docker and kubectl access

## Files Used For Review-2

- `Dockerfile`
- `Jenkinsfile`
- `Deployment.yaml`
- `Service.yaml`

## Local Minikube Setup

```bash
minikube start
kubectl cluster-info
```

## Manual Deploy Commands (Reference)

Build image inside Minikube Docker daemon:

```bash
eval $(minikube -p minikube docker-env)
docker build -t blog-app-image:latest .
```

Apply manifests:

```bash
kubectl apply -f Deployment.yaml
kubectl apply -f Service.yaml
```

Verify resources:

```bash
kubectl get pods
kubectl get services
```

Open app:

```bash
minikube service blog-app-service --url
```

## Jenkins Pipeline Flow

The pipeline performs:

1. Checkout
2. Docker build in Minikube Docker daemon
3. Kubernetes apply (`Deployment.yaml`, `Service.yaml`)
4. Deployment image update with build tag
5. Rollout verification (`kubectl rollout status`)

## Review-2 Demo Checklist

1. Trigger Jenkins job.
2. Show pipeline logs for Docker build and Kubernetes deploy.
3. Run `kubectl get pods` and `kubectl get services`.
4. Open NodePort URL and show app UI.
5. Submit dummy data from the app.
