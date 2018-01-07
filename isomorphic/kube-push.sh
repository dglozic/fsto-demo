docker build -t fsto-demo/isomorphic .
docker tag fsto-demo/isomorphic:latest registry.ng.bluemix.net/fsto_demo/isomorphic:latest
docker push registry.ng.bluemix.net/fsto_demo/isomorphic:latest
kubectl delete deployment isomorphic-deployment
kubectl apply -f k8s/deployment.yml