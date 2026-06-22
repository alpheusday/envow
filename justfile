set shell := ["bash", "-cu"]
set windows-shell := ["pwsh", "-Command"]

tsc := "pnpm exec tsc"
biome := "pnpm exec biome"
tsdown := "pnpm exec tsdown"
vitest := "pnpm exec vitest"
vite := "pnpm exec vite"
next := "pnpm exec next"

publish_dev := "pnpm publish --no-git-checks --tag dev --access public"
publish := "pnpm publish --access public"

pkg := "package"

tst := "test"

ex_client := "examples/client"

ex_server := "examples/server"

ex_next := "examples/next"

# Default action
_:
    just --list -u

# Install
i:
    pnpm install

# Format code
fmt:
    {{biome}} check --write .

# Lint code with ls-lint
ls-lint:
    cd ./{{pkg}}/src && ls-lint -config ../../.ls-lint.yaml

# Lint code with ls-lint
lslint:
    just ls-lint

# Lint code with typos-cli
typos:
    typos

# Lint code with TypeScript Compiler
tsc:
    cd ./{{pkg}} && {{tsc}} --noEmit

    cd ./{{tst}} && {{tsc}} --noEmit

    cd ./{{ex_client}} && {{tsc}} --noEmit
    cd ./{{ex_server}} && {{tsc}} --noEmit
    cd ./{{ex_next}} && {{tsc}} --noEmit

# Lint code
lint:
    just lslint
    just typos
    just tsc

# Lint code with Biome
lint-biome:
    {{biome}} lint .

# Build package
build:
    cd ./{{pkg}} && {{tsdown}} -c tsdown.config.ts

# Test package
test:
    cd ./{{tst}} && {{vitest}} run

# Check code
check:
    just build
    just fmt
    just lint
    just test

# Run the client example dev server
ex-client-dev:
    cd ./{{ex_client}} && {{vite}} dev

# Build the client example
ex-client-build:
    cd ./{{ex_client}} && {{vite}} build

# Run the server example dev server
ex-server-dev:
    cd ./{{ex_server}} && {{vite}} dev

# Build the server example
ex-server-build:
    cd ./{{ex_server}} && {{vite}} build

# Run the Next.js example dev server (port 3001)
ex-next-dev:
    cd ./{{ex_next}} && {{next}} dev --port 3001

# Build the Next.js example
ex-next-build:
    cd ./{{ex_next}} && {{next}} build

# Start the Next.js example prod server (port 3000)
ex-next-start:
    cd ./{{ex_next}} && {{next}} start --port 3000

# Publish package with dev tag as dry-run
publish-dev-try:
    cd ./{{pkg}} && {{publish_dev}} --dry-run

# Publish package with dev tag
publish-dev:
    cd ./{{pkg}} && {{publish_dev}}

# Publish package as dry-run
publish-try:
    cd ./{{pkg}} && {{publish}} --dry-run

# Publish package
publish:
    cd ./{{pkg}} && {{publish}}

# Clean builds (Linux)
clean-linux:
    rm -rf ./{{ex_client}}/dist
    rm -rf ./{{ex_server}}/dist
    rm -rf ./{{ex_next}}/.next

    rm -rf ./{{pkg}}/dist

# Clean builds (macOS)
clean-macos:
    just clean-linux

# Clean builds (Windows)
clean-windows:
    if (Test-Path "./{{ex_client}}/dist") { Remove-Item -Recurse -Force "./{{ex_client}}/dist" }
    if (Test-Path "./{{ex_server}}/dist") { Remove-Item -Recurse -Force "./{{ex_server}}/dist" }
    if (Test-Path "./{{ex_next}}/.next") { Remove-Item -Recurse -Force "./{{ex_next}}/.next" }

    if (Test-Path "./{{pkg}}/dist") { Remove-Item -Recurse -Force "./{{pkg}}/dist" }

# Clean builds
clean:
    just clean-{{os()}}

# Clean everything (Linux)
clean-all-linux:
    just clean

    rm -rf ./{{ex_client}}/node_modules
    rm -rf ./{{ex_server}}/node_modules
    rm -rf ./{{ex_next}}/node_modules
    rm -rf ./{{ex_next}}/next-env.d.ts
    rm -rf ./{{ex_next}}/tsconfig.tsbuildinfo

    rm -rf ./{{tst}}/node_modules

    rm -rf ./{{pkg}}/node_modules

    rm -rf ./node_modules

# Clean everything (macOS)
clean-all-macos:
    just clean-all-linux

# Clean everything (Windows)
clean-all-windows:
    just clean

    if (Test-Path "./{{ex_client}}/node_modules") { Remove-Item -Recurse -Force "./{{ex_client}}/node_modules" }
    if (Test-Path "./{{ex_server}}/node_modules") { Remove-Item -Recurse -Force "./{{ex_server}}/node_modules" }
    if (Test-Path "./{{ex_next}}/node_modules") { Remove-Item -Recurse -Force "./{{ex_next}}/node_modules" }
    if (Test-Path "./{{ex_next}}/next-env.d.ts") { Remove-Item -Recurse -Force "./{{ex_next}}/next-env.d.ts" }
    if (Test-Path "./{{ex_next}}/tsconfig.tsbuildinfo") { Remove-Item -Recurse -Force "./{{ex_next}}/tsconfig.tsbuildinfo" }

    if (Test-Path "./{{tst}}/node_modules") { Remove-Item -Recurse -Force "./{{tst}}/node_modules" }

    if (Test-Path "./{{pkg}}/node_modules") { Remove-Item -Recurse -Force "./{{pkg}}/node_modules" }

    if (Test-Path "./node_modules") { Remove-Item -Recurse -Force "./node_modules" }

# Clean everything
clean-all:
    just clean-all-{{os()}}
