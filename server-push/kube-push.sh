docker build -t fsto-demo/server-push .
docker tag fsto-demo/server-push:latest registry.ng.bluemix.net/fsto_demo/server-push:latest
docker push registry.ng.bluemix.net/fsto_demo/server-push:latest
kubectl delete deployment server-push-deployment
kubectl apply -f k8s/deployment.yml