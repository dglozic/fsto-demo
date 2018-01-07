docker build -t fsto-demo/header .
docker tag fsto-demo/header:latest registry.ng.bluemix.net/fsto_demo/header:latest
docker push registry.ng.bluemix.net/fsto_demo/header:latest
kubectl delete deployment header-deployment
kubectl apply -f k8s/deployment.yml