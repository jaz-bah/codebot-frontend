import { ICommandCard } from "@/types/global.type";


export const shopifyCommands : ICommandCard[] = [
    {
        title: "Install & Auth",
        commands: [
            { cmd: "npm install -g @shopify/cli@latest", desc: "# Install Shopify CLI" },
            { cmd: "brew tap shopify/shopify && brew install shopify-cli", desc: "# Install Shopify CLI with Homebrew (macOS)" },
            { cmd: "shopify version", desc: "# Show CLI version" },
            { cmd: "shopify upgrade", desc: "# Upgrade Shopify CLI" },
            { cmd: "shopify auth logout", desc: "# Log out (login prompts automatically on the next command)" },
            { cmd: "shopify help", desc: "# List all commands" },
            { cmd: "shopify theme --help", desc: "# Help for a command group" },
            { cmd: "export SHOPIFY_FLAG_STORE=<store>.myshopify.com", desc: "# Set a default store for CLI commands" },
            { cmd: "export SHOPIFY_CLI_THEME_TOKEN=<theme-access-password>", desc: "# Authenticate with a Theme Access password (CI)" }
        ]
    },
    {
        title: "Theme - Create & Develop",
        commands: [
            { cmd: "shopify theme init", desc: "# Clone the Dawn starter theme" },
            { cmd: "shopify theme init <name> --clone-url <git-url>", desc: "# Start from a custom theme repo" },
            { cmd: "shopify theme dev --store <store>.myshopify.com", desc: "# Local dev server with live reload" },
            { cmd: "shopify theme dev --store <store> --theme <id-or-name>", desc: "# Develop against an existing theme" },
            { cmd: "shopify theme dev --port 9293", desc: "# Use a custom local port" },
            { cmd: "shopify theme dev --open", desc: "# Open the preview in your browser" },
            { cmd: "shopify theme dev --live-reload hot-reload", desc: "# Reload mode: hot-reload | full-page | off" },
            { cmd: "shopify theme dev --theme-editor-sync", desc: "# Sync theme editor changes back to local files" },
            { cmd: "shopify theme dev --only 'sections/*' --only 'snippets/*'", desc: "# Only sync matching files" },
            { cmd: "shopify theme dev --ignore 'config/settings_data.json'", desc: "# Skip matching files" },
            { cmd: "shopify theme dev --nodelete", desc: "# Don't delete remote files missing locally" },
            { cmd: "shopify theme dev --environment staging", desc: "# Use an environment from shopify.theme.toml" }
        ]
    },
    {
        title: "Theme - Pull & Push",
        commands: [
            { cmd: "shopify theme pull", desc: "# Download a theme from the store (pick interactively)" },
            { cmd: "shopify theme pull --live", desc: "# Pull the live (published) theme" },
            { cmd: "shopify theme pull --theme <id>", desc: "# Pull a specific theme" },
            { cmd: "shopify theme pull --development", desc: "# Pull your development theme" },
            { cmd: "shopify theme pull --only 'templates/*.json' --only 'config/settings_data.json'", desc: "# Pull only editor-managed files" },
            { cmd: "shopify theme push", desc: "# Upload local files to a theme" },
            { cmd: "shopify theme push --unpublished --theme '<New Theme Name>'", desc: "# Push as a brand-new unpublished theme" },
            { cmd: "shopify theme push --theme <id>", desc: "# Push to a specific theme" },
            { cmd: "shopify theme push --development", desc: "# Push to your development theme" },
            { cmd: "shopify theme push --live --allow-live", desc: "# Push straight to the live theme (careful!)" },
            { cmd: "shopify theme push --only 'sections/*'", desc: "# Push only matching files" },
            { cmd: "shopify theme push --ignore 'templates/*.json' --ignore 'config/settings_data.json'", desc: "# Push code without overwriting merchant content" },
            { cmd: "shopify theme push --nodelete", desc: "# Don't delete remote files missing locally" },
            { cmd: "shopify theme push --publish", desc: "# Publish the theme after pushing" },
            { cmd: "shopify theme push --json", desc: "# Machine-readable output (CI)" },
            { cmd: "shopify theme push --environment staging", desc: "# Push using an environment from shopify.theme.toml" }
        ]
    },
    {
        title: "Theme - Manage",
        commands: [
            { cmd: "shopify theme list", desc: "# List themes on the store" },
            { cmd: "shopify theme list --role live", desc: "# Filter by role (live, unpublished, development)" },
            { cmd: "shopify theme info", desc: "# Show details of the current theme/store" },
            { cmd: "shopify theme open", desc: "# Open the theme preview" },
            { cmd: "shopify theme open --editor", desc: "# Open the theme editor" },
            { cmd: "shopify theme open --live", desc: "# Open the live theme" },
            { cmd: "shopify theme publish --theme <id>", desc: "# Make a theme live" },
            { cmd: "shopify theme duplicate --theme <id>", desc: "# Duplicate a theme (backup before big changes)" },
            { cmd: "shopify theme rename --theme <id> --name '<New Name>'", desc: "# Rename a theme" },
            { cmd: "shopify theme delete --theme <id>", desc: "# Delete a theme" },
            { cmd: "shopify theme delete --development", desc: "# Delete your development theme" },
            { cmd: "shopify theme share", desc: "# Create a shareable preview link" },
            { cmd: "shopify theme package", desc: "# Package the theme into a zip" },
            { cmd: "shopify theme console", desc: "# Liquid REPL to test expressions against the store" },
            { cmd: "shopify theme profile --url /products/<handle>", desc: "# Profile Liquid render performance of a page" }
        ]
    },
    {
        title: "Theme Check (Linting)",
        commands: [
            { cmd: "shopify theme check", desc: "# Lint the theme for errors and best practices" },
            { cmd: "shopify theme check --auto-correct", desc: "# Auto-fix what can be fixed" },
            { cmd: "shopify theme check --fail-level error", desc: "# Only fail on errors (useful for CI)" },
            { cmd: "shopify theme check --output json", desc: "# JSON output" },
            { cmd: "shopify theme check --category performance", desc: "# Run only one category" },
            { cmd: "shopify theme check --list", desc: "# List enabled checks" },
            { cmd: "shopify theme check --init", desc: "# Create a .theme-check.yml config" },
            { cmd: "shopify theme language-server", desc: "# Start the Liquid language server (editor integration)" }
        ]
    },
    {
        title: "Theme Config Files",
        commands: [
            { cmd: "[environments.staging]\\nstore = \"<store>.myshopify.com\"\\ntheme = \"<id>\"", desc: "# shopify.theme.toml: define named environments" },
            { cmd: ".shopifyignore", desc: "# Files to exclude from push/pull/dev (gitignore syntax)" },
            { cmd: ".theme-check.yml", desc: "# Theme Check configuration" },
            { cmd: "config/settings_schema.json", desc: "# Global theme settings definitions" },
            { cmd: "config/settings_data.json", desc: "# Saved global settings values (editor-managed)" },
            { cmd: "templates/*.json", desc: "# JSON templates (section order and settings)" },
            { cmd: "sections/*.liquid", desc: "# Sections (with {% schema %})" },
            { cmd: "blocks/*.liquid", desc: "# Theme blocks (reusable across sections)" },
            { cmd: "snippets/*.liquid", desc: "# Reusable snippets ({% render %})" },
            { cmd: "layout/theme.liquid", desc: "# Main layout wrapper" },
            { cmd: "locales/en.default.json", desc: "# Translations" },
            { cmd: "assets/", desc: "# CSS, JS, images, fonts" }
        ]
    },
    {
        title: "Liquid Essentials",
        commands: [
            { cmd: "{% render 'snippet', product: product, size: 'large' %}", desc: "# Render a snippet with variables" },
            { cmd: "{% section 'header' %}", desc: "# Render a static section" },
            { cmd: "{% sections 'header-group' %}", desc: "# Render a section group" },
            { cmd: "{% content_for 'blocks' %}", desc: "# Render theme blocks inside a section" },
            { cmd: "{% schema %}{ ... }{% endschema %}", desc: "# Section settings, blocks and presets (JSON)" },
            { cmd: "{% stylesheet %}...{% endstylesheet %}", desc: "# Section/snippet-scoped CSS" },
            { cmd: "{% javascript %}...{% endjavascript %}", desc: "# Section/snippet-scoped JS" },
            { cmd: "{% liquid ... %}", desc: "# Write multiple Liquid statements without tag delimiters" },
            { cmd: "{% assign x = value %}", desc: "# Create a variable" },
            { cmd: "{% capture x %}...{% endcapture %}", desc: "# Capture a block of output into a variable" },
            { cmd: "{% if cond %}...{% elsif %}...{% else %}...{% endif %}", desc: "# Conditionals" },
            { cmd: "{% case x %}{% when 'a' %}...{% endcase %}", desc: "# Switch statement" },
            { cmd: "{% for item in collection.products limit: 4 %}...{% endfor %}", desc: "# Loop" },
            { cmd: "{{ forloop.index }} / {{ forloop.first }} / {{ forloop.last }}", desc: "# Loop helpers" },
            { cmd: "{% paginate collection.products by 12 %}...{% endpaginate %}", desc: "# Pagination" },
            { cmd: "{% form 'product', product %}...{% endform %}", desc: "# Product (add to cart) form" },
            { cmd: "{% comment %}...{% endcomment %}", desc: "# Comment" },
            { cmd: "{{ section.settings.heading }}", desc: "# Read a section setting" },
            { cmd: "{% for block in section.blocks %}{{ block.shopify_attributes }}{% endfor %}", desc: "# Loop blocks (keep editor attributes)" },
            { cmd: "{{ settings.color_primary }}", desc: "# Read a global theme setting" },
            { cmd: "{{ 'key.path' | t }}", desc: "# Translate using locales" },
            { cmd: "{{ product.price | money }}", desc: "# Format money" },
            { cmd: "{{ product.title | escape }}", desc: "# Escape HTML" },
            { cmd: "{{ value | default: 'fallback' }}", desc: "# Fallback value" },
            { cmd: "{{ product.description | strip_html | truncate: 120 }}", desc: "# Plain-text excerpt" },
            { cmd: "{{ product | json }}", desc: "# Output an object as JSON (for JS)" },
            { cmd: "{{ 'theme.css' | asset_url | stylesheet_tag }}", desc: "# Load a CSS asset" },
            { cmd: "<script src=\"{{ 'app.js' | asset_url }}\" defer></script>", desc: "# Load a JS asset" },
            { cmd: "{{ product.featured_image | image_url: width: 800 | image_tag: loading: 'lazy' }}", desc: "# Responsive image tag" },
            { cmd: "{{ product.metafields.custom.<key>.value }}", desc: "# Read a product metafield" },
            { cmd: "{{ shop.metafields.custom.<key>.value }}", desc: "# Read a shop metafield" },
            { cmd: "{{ product.selected_or_first_available_variant.id }}", desc: "# Default variant ID" },
            { cmd: "{{ request.design_mode }}", desc: "# True inside the theme editor" },
            { cmd: "{{ routes.cart_url }}", desc: "# Locale-aware routes (cart, root, search...)" },
            { cmd: "{{ cart.item_count }}", desc: "# Number of items in cart" },
            { cmd: "{{ content_for_header }}", desc: "# Required in <head> of theme.liquid" },
            { cmd: "{{ content_for_layout }}", desc: "# Required in <body> of theme.liquid" }
        ]
    },
    {
        title: "Storefront AJAX & Section Rendering",
        commands: [
            { cmd: "fetch(`${window.Shopify.routes.root}cart.js`)", desc: "# Get the cart as JSON" },
            { cmd: "fetch(`${window.Shopify.routes.root}cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }) })", desc: "# Add to cart" },
            { cmd: "fetch(`${window.Shopify.routes.root}cart/change.js`, { method: 'POST', ... body: JSON.stringify({ id: lineKey, quantity: 2 }) })", desc: "# Change a line item quantity (use quantity 0 to remove)" },
            { cmd: "fetch(`${window.Shopify.routes.root}cart/update.js`, { method: 'POST', ... body: JSON.stringify({ note: '...' }) })", desc: "# Update cart note, attributes or quantities" },
            { cmd: "fetch(`${window.Shopify.routes.root}cart/clear.js`, { method: 'POST' })", desc: "# Empty the cart" },
            { cmd: "/cart/add.js  body: { items: [...], sections: 'cart-drawer,cart-icon-bubble' }", desc: "# Add to cart and get re-rendered sections back" },
            { cmd: "fetch(`${window.location.pathname}?section_id=<section-id>`)", desc: "# Section Rendering API: fetch a section's HTML" },
            { cmd: "fetch(`${window.location.pathname}?sections=<id1>,<id2>`)", desc: "# Fetch multiple sections as JSON" },
            { cmd: "fetch(`${window.location.pathname}?variant=<id>&section_id=<section-id>`)", desc: "# Re-render a product section for another variant" },
            { cmd: "/products/<handle>.js", desc: "# Product JSON (variants, options, availability)" },
            { cmd: "/products/<handle>.json", desc: "# Product JSON (admin-style structure)" },
            { cmd: "/collections/<handle>/products.json?limit=12&page=1", desc: "# Collection products as JSON" },
            { cmd: "/search/suggest.json?q=<term>&resources[type]=product", desc: "# Predictive search" },
            { cmd: "/recommendations/products.json?product_id=<id>&limit=4&intent=related", desc: "# Product recommendations" },
            { cmd: "window.Shopify", desc: "# Browser global: Shopify.shop, Shopify.theme.id, Shopify.locale, Shopify.currency" },
            { cmd: "window.Shopify.routes.root", desc: "# Locale/market-aware root URL for fetch calls" }
        ]
    },
    {
        title: "Apps - Create & Develop",
        commands: [
            { cmd: "shopify app init", desc: "# Create a new app" },
            { cmd: "shopify app dev", desc: "# Run the app locally with a tunnel and dev store" },
            { cmd: "shopify app dev --reset", desc: "# Reset the linked org/app/dev store selection" },
            { cmd: "shopify app dev --store <store>.myshopify.com", desc: "# Develop against a specific dev store" },
            { cmd: "shopify app dev clean", desc: "# Remove the dev preview from the dev store" },
            { cmd: "shopify app generate extension", desc: "# Add an extension (interactive)" },
            { cmd: "shopify app generate extension --template theme_app_extension", desc: "# Add a theme app extension (app blocks / embeds)" },
            { cmd: "shopify app build", desc: "# Build the app and extensions" },
            { cmd: "shopify app info", desc: "# Show app and environment info" },
            { cmd: "shopify app logs", desc: "# Stream app/function logs" },
            { cmd: "shopify app import-extensions", desc: "# Import extensions created in the Partner dashboard" }
        ]
    },
    {
        title: "Apps - Config, Deploy & Webhooks",
        commands: [
            { cmd: "shopify app config link", desc: "# Link local app to an app in the Dev Dashboard" },
            { cmd: "shopify app config use <name>", desc: "# Switch between app config files (shopify.app.<name>.toml)" },
            { cmd: "shopify app env pull", desc: "# Pull app env vars to .env" },
            { cmd: "shopify app env show", desc: "# Print app env vars" },
            { cmd: "shopify app deploy", desc: "# Create and deploy a new app version" },
            { cmd: "shopify app deploy --force", desc: "# Deploy without confirmation prompts (CI)" },
            { cmd: "shopify app release --version <version>", desc: "# Release a previously created version" },
            { cmd: "shopify app versions list", desc: "# List app versions" },
            { cmd: "shopify app webhook trigger --topic orders/create --api-version <version> --delivery-method http --address <url>", desc: "# Send a test webhook" }
        ]
    },
    {
        title: "Shopify Functions",
        commands: [
            { cmd: "shopify app generate extension --template <function-template>", desc: "# Create a Function (discounts, delivery, payment, validation...)" },
            { cmd: "shopify app function build", desc: "# Compile the Function" },
            { cmd: "shopify app function run", desc: "# Run the Function locally with sample input" },
            { cmd: "shopify app function replay", desc: "# Replay a real execution from logs" },
            { cmd: "shopify app function schema", desc: "# Download the Function GraphQL schema" },
            { cmd: "shopify app function typegen", desc: "# Generate types from your GraphQL input query" }
        ]
    },
    {
        title: "Hydrogen (Headless)",
        commands: [
            { cmd: "shopify hydrogen init", desc: "# Create a Hydrogen storefront" },
            { cmd: "shopify hydrogen dev", desc: "# Start the dev server" },
            { cmd: "shopify hydrogen build", desc: "# Production build" },
            { cmd: "shopify hydrogen preview", desc: "# Preview the production build locally" },
            { cmd: "shopify hydrogen deploy", desc: "# Deploy to Oxygen" },
            { cmd: "shopify hydrogen link", desc: "# Link to a Hydrogen storefront" },
            { cmd: "shopify hydrogen env pull", desc: "# Pull environment variables" },
            { cmd: "shopify hydrogen codegen", desc: "# Generate GraphQL types" },
            { cmd: "shopify hydrogen upgrade", desc: "# Upgrade Hydrogen dependencies" }
        ]
    },
    {
        title: "GraphQL & API Requests",
        commands: [
            { cmd: "curl -X POST https://<store>.myshopify.com/admin/api/<version>/graphql.json -H 'Content-Type: application/json' -H 'X-Shopify-Access-Token: <token>' -d '{\"query\":\"{ shop { name } }\"}'", desc: "# Admin GraphQL API request (version like 2026-10)" },
            { cmd: "curl -X POST https://<store>.myshopify.com/api/<version>/graphql.json -H 'Content-Type: application/json' -H 'X-Shopify-Storefront-Access-Token: <token>' -d '{\"query\":\"{ shop { name } }\"}'", desc: "# Storefront GraphQL API request" },
            { cmd: "query { products(first: 5) { nodes { id title handle } } }", desc: "# Example: list products" },
            { cmd: "query { product(id: \"gid://shopify/Product/<id>\") { title variants(first: 10) { nodes { id title } } } }", desc: "# Example: product with variants" },
            { cmd: "gid://shopify/Product/<id>", desc: "# GraphQL ID format (Product, ProductVariant, Order, Customer...)" },
            { cmd: "press 'g' while running `shopify app dev`", desc: "# Open the local GraphiQL explorer" }
        ]
    }
];
