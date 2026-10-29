#!/bin/bash
# 服务器与 CI 都调用 /opt/home/deploy.sh，实现只保留在 scripts/deploy.sh，
# 这里仅做转发，避免两份脚本各自演进。
set -e
exec bash "$(dirname "$0")/scripts/deploy.sh" "$@"
