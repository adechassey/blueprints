#!/bin/sh
# Install or update the Theodo Blueprints CLI
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/adechassey/blueprints/main/install.sh | sh
#
set -e

REPO="adechassey/blueprints"
BINARY_NAME="theodo-blueprints"
INSTALL_DIR="/usr/local/bin"

# Detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  darwin) OS="darwin" ;;
  linux)  OS="linux" ;;
  *)
    echo "Unsupported OS: $OS"
    echo "Download manually from https://github.com/$REPO/releases"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

TARGET="${OS}-${ARCH}"
ASSET_NAME="theodo-blueprints-${TARGET}.tar.gz"

# Get latest release tag
LATEST=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST" ]; then
  echo "Could not determine latest release. Check https://github.com/$REPO/releases"
  exit 1
fi

DOWNLOAD_URL="https://github.com/$REPO/releases/download/${LATEST}/${ASSET_NAME}"

echo "Installing $BINARY_NAME $LATEST ($TARGET)..."

# Download and extract
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

curl -fsSL "$DOWNLOAD_URL" -o "$TMPDIR/$ASSET_NAME"
tar -xzf "$TMPDIR/$ASSET_NAME" -C "$TMPDIR"

# Install
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMPDIR/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
else
  echo "Need sudo to install to $INSTALL_DIR"
  sudo mv "$TMPDIR/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
fi

chmod +x "$INSTALL_DIR/$BINARY_NAME"

echo "Installed $BINARY_NAME to $INSTALL_DIR/$BINARY_NAME"
echo ""
$BINARY_NAME --version 2>/dev/null && echo "Run '$BINARY_NAME --help' to get started." || echo "Run '$INSTALL_DIR/$BINARY_NAME --help' to get started."
