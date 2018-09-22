# VoxelModeler

### Release

```
$ heroku plugins:install heroku-cli-static
```

```
yarn build
```

```
git checkout -b release-XXX
git add -f dist
git commit -m 'dist'
```

```
heroku static:deploy
```
