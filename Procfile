web: deno run --allow-read --allow-net=:$PORT,deno.land,accounts.google.com,www.googleapis.com,esm.sh,cdn.esm.sh,registry.npmjs.org,${DATABASE_HOSTNAME}:0,${DATABASE_HOSTNAME}:5432 --allow-write=./.aleph,${HOME}/.cache,{HOME}/.heroku/cache --allow-env=ALEPH_DEV,DENO_TESTING,ALEPH_DEV_PORT,ALEPH_ENV,ALEPH_FRAMEWORK,ALEPH_WORKING_DIR,ALEPH_VERSION,ESBUILD_BINARY_PATH,XDG_CACHE_HOME,HOME,APP_AUTH_CLIENT_ID,APP_AUTH_CLIENT_SECRET,DATABASE_URL --allow-run=$(which deno),${HOME}/.cache/esbuild/bin/esbuild-linux-64@0.13.2 --import-map=import_map.json --location=https://md-sns.herokuapp.com --unstable --no-check --unsafely-ignore-certificate-errors=${DATABASE_HOSTNAME} https://deno.land/x/aleph@v0.3.0-beta.19/commands/start.ts --port=$PORT
