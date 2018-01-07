docker build -t fsto-demo/angular-seed .
docker tag fsto-demo/angular-seed:latest registry.ng.bluemix.net/fsto_demo/angular-seed:latest
docker push registry.ng.bluemix.net/fsto_demo/angular-seed:latest
kubectl delete deployment angular-seed-deployment
kubectl apply -f k8s/deployment.yml