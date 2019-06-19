# Helm Chart for Konga on Kubernetes

For more info, see:
- [Helm Chart Docs](https://helm.sh/docs/developing_charts/#charts)
- [Bitnami Chart Guide](https://docs.bitnami.com/kubernetes/how-to/create-your-first-helm-chart)

## Packaging

To create the Chart `.tgz` package, you must:

- Run `helm package ./charts/konga` from the repo's root directory.
- Move the created `konga-{version}.tgz` file to `./charts/konga-{version}.tgz`.
- Remove the old `.tgz` file, if updating the version.
