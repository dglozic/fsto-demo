docker build -t fsto-demo/home .
docker tag fsto-demo/home:latest registry.ng.bluemix.net/fsto_demo/home:latest
docker push registry.ng.bluemix.net/fsto_demo/home:latest
kubectl delete deployment home-deployment
kubectl apply -f k8s/deployment.yml