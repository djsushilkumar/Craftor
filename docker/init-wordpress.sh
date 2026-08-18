#!/usr/bin/env bash
set -e

echo "================================================================"
echo "    CRAFTOR DISPOSABLE WORDPRESS & ELEMENTOR BOOTSTRAPPER      "
echo "================================================================"

MARKER_FILE="/var/www/html/wp-content/.craftor_initialized"

# 1. Wait for MariaDB / MySQL
echo "[1/7] Waiting for MariaDB service..."
until wp db query "SELECT 1;" --path=/var/www/html --allow-root >/dev/null 2>&1; do
  echo "  Waiting for database connection..."
  sleep 2
done
echo "  ✅ MariaDB is reachable and ready."

# 2. Install WordPress Core if not installed
echo "[2/7] Checking WordPress Core installation..."
if ! wp core is-installed --path=/var/www/html --allow-root 2>/dev/null; then
  echo "  Installing WordPress Core 6.5..."
  wp core install \
    --path=/var/www/html \
    --url="${WP_SITE_URL:-http://localhost:8080}" \
    --title="Craftor Live Test Environment" \
    --admin_user="${WP_ADMIN_USER:-admin}" \
    --admin_password="${WP_ADMIN_PASSWORD:-adminpassword}" \
    --admin_email="${WP_ADMIN_EMAIL:-admin@craftor.test}" \
    --skip-email \
    --allow-root
  echo "  ✅ WordPress Core installed successfully."
else
  echo "  ✅ WordPress Core is already installed."
fi

# 3. Configure REST Friendly Permalinks
echo "[3/7] Setting up SEO/REST permalink structure..."
wp rewrite structure '/%postname%/' --hard --path=/var/www/html --allow-root
echo "  ✅ Permalinks configured to /%postname%/."

# 4. Install & Activate Elementor
echo "[4/7] Installing & Activating Elementor..."
if ! wp plugin is-installed elementor --path=/var/www/html --allow-root 2>/dev/null; then
  wp plugin install elementor --version=3.20.0 --activate --path=/var/www/html --allow-root || wp plugin install elementor --activate --path=/var/www/html --allow-root
  echo "  ✅ Elementor plugin installed and activated."
else
  wp plugin activate elementor --path=/var/www/html --allow-root
  echo "  ✅ Elementor plugin activated."
fi

# 5. Install & Activate WooCommerce
echo "[5/7] Installing & Activating WooCommerce..."
if ! wp plugin is-installed woocommerce --path=/var/www/html --allow-root 2>/dev/null; then
  wp plugin install woocommerce --version=8.7.0 --activate --path=/var/www/html --allow-root || wp plugin install woocommerce --activate --path=/var/www/html --allow-root
  echo "  ✅ WooCommerce plugin installed and activated."
else
  wp plugin activate woocommerce --path=/var/www/html --allow-root
  echo "  ✅ WooCommerce plugin activated."
fi

# 6. Activate Craftor Plugins
echo "[6/7] Activating Craftor Core plugin suite..."
wp plugin activate craftor-core --path=/var/www/html --allow-root
if [ -d "/var/www/html/wp-content/plugins/craftor-pro" ]; then
  wp plugin activate craftor-pro --path=/var/www/html --allow-root 2>/dev/null || true
fi
if [ -d "/var/www/html/wp-content/plugins/craftor-enterprise" ]; then
  wp plugin activate craftor-enterprise --path=/var/www/html --allow-root 2>/dev/null || true
fi
echo "  ✅ Craftor Core active."

# 7. Configure Craftor API Token & Test Baseline
echo "[7/7] Seeding Craftor Zero-Trust API Token..."
CRAFTOR_TOKEN="${CRAFTOR_API_TOKEN:-crf_test_live_token_2026}"
wp option update craftor_api_token "$CRAFTOR_TOKEN" --path=/var/www/html --allow-root
echo "  ✅ Craftor API Token seeded in wp_options."

# Create sample baseline page if none exists
if ! wp post get 101 --path=/var/www/html --allow-root >/dev/null 2>&1; then
  wp post create --post_type=page --post_title="Gym & Fitness Home" --post_status=publish --post_name="gym-home" --ID=101 --path=/var/www/html --allow-root 2>/dev/null || true
fi

touch "$MARKER_FILE"

echo "================================================================"
echo "    🚀 CRAFTOR LIVE ENVIRONMENT READY ON http://localhost:8080  "
echo "================================================================"
