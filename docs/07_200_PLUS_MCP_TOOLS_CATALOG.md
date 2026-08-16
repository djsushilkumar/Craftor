# Craftor — Complete 200+ MCP Tools Catalog

**Document ID:** CAT-2026-001  
**Project Name:** Craftor  
**Version:** 1.0.0  
**Status:** Approved for Implementation

---

## Catalog Structure & Overview

The Craftor Model Context Protocol (MCP) server exposes a categorized catalog of **240 specialized tools**, enabling AI clients to perform atomic, compound, and transactional operations across WordPress, Elementor, WooCommerce, and Multi-Site networks with zero-shot accuracy.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               240 CRAFTOR MCP TOOLS TAXONOMY                            │
├────────────────────────────────────────────────────────┬───────────────────────────────┤
│ Category                                               │ Tool Count & ID Range         │
├────────────────────────────────────────────────────────┼───────────────────────────────┤
│ 1. WordPress Core, Posts, Pages & Content Ops          │ 35 Tools (#001 – #035)        │
│ 2. Elementor Canvas, Containers & Flexbox Layouts      │ 40 Tools (#036 – #075)        │
│ 3. Elementor Global Kits, Styling & Design Tokens      │ 25 Tools (#076 – #100)        │
│ 4. Elementor Theme Builder & Dynamic Data Sources      │ 20 Tools (#101 – #120)        │
│ 5. WooCommerce Catalog, Products & Variations          │ 35 Tools (#121 – #155)        │
│ 6. WooCommerce Orders, Customers, Coupons & Stock      │ 25 Tools (#156 – #180)        │
│ 7. Media Library, Assets & Optimization                │ 15 Tools (#181 – #195)        │
│ 8. SEO, Metadata, Taxonomies & Schema Markup           │ 15 Tools (#196 – #210)        │
│ 9. Site Operations, DB, WP-CLI & Cache Performance     │ 15 Tools (#211 – #225)        │
│ 10. Multi-Site, Security, Audit & Micro-Rollback       │ 15 Tools (#226 – #240)        │
├────────────────────────────────────────────────────────┼───────────────────────────────┤
│ TOTAL ACTIVE TOOLS                                     │ 240 Tools                     │
└────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## Category 1: WordPress Core & Content Management (#001 – #035)

1. `wp_get_post` — Retrieve post object, raw content, rendered HTML, and metadata by ID/slug.
2. `wp_create_post` — Create a new post with status (draft/publish/private), author, and date.
3. `wp_update_post` — Update post title, content, excerpt, status, or slug with revision tracking.
4. `wp_delete_post` — Move post to trash or permanently delete with explicit confirmation flag.
5. `wp_batch_create_posts` — High-speed bulk creation of multiple posts in a single transactional batch.
6. `wp_batch_update_posts` — Bulk update properties across multiple posts matching query criteria.
7. `wp_get_page` — Retrieve single page hierarchy, parent-child tree, and template assignments.
8. `wp_create_page` — Create standard page with parent hierarchy and custom page templates.
9. `wp_update_page` — Update existing page parameters, status, and layout template assignments.
10. `wp_delete_page` — Safely trash or permanently remove a WordPress page.
11. `wp_query_posts` — Query posts using complex `WP_Query` arguments, meta queries, and tax queries.
12. `wp_get_post_revisions` — List all stored revisions and timestamps for a specific post/page.
13. `wp_restore_post_revision` — Restore a specific WordPress revision by revision ID.
14. `wp_get_post_meta` — Fetch single or all custom postmeta keys and values for a post.
15. `wp_update_post_meta` — Set or update custom postmeta values with automatic JSON serialization.
16. `wp_delete_post_meta` — Delete specific postmeta keys from a post.
17. `wp_register_cpt` — Dynamically register a new Custom Post Type with custom labels and arguments.
18. `wp_list_cpts` — List all registered public and private Custom Post Types.
19. `wp_get_cpt_details` — Inspect capabilities, supports, and taxonomy bindings of a CPT.
20. `wp_get_taxonomies` — List all registered hierarchical and non-hierarchical taxonomies.
21. `wp_create_term` — Create a new category, tag, or custom taxonomy term.
22. `wp_update_term` — Update term name, slug, description, or parent hierarchy.
23. `wp_delete_term` — Delete a taxonomy term and reassign or detach orphaned posts.
24. `wp_assign_terms` — Assign one or more taxonomy terms to a specific post.
25. `wp_get_nav_menus` — List all registered navigation menus and their location bindings.
26. `wp_create_nav_menu` — Create a new navigation menu container.
27. `wp_add_nav_menu_item` — Append custom links, pages, CPTs, or categories to a menu.
28. `wp_update_nav_menu_tree` — Reorder, nest (sub-menus), and update full navigation menu hierarchies.
29. `wp_delete_nav_menu` — Delete a navigation menu and unbind from theme locations.
30. `wp_get_site_options` — Retrieve WordPress options table values with security allowlist validation.
31. `wp_update_site_option` — Update site settings (title, tagline, timezone, permalinks) safely.
32. `wp_get_user_profile` — Inspect user capabilities, roles, and profile metadata.
33. `wp_create_user` — Provision a new WordPress user with specific roles and passwords.
34. `wp_update_user_role` — Promote, demote, or assign capabilities to existing users.
35. `wp_list_comments` — Query, moderate, approve, or reply to WordPress comments.

---

## Category 2: Elementor Canvas, Containers & Flexbox Layouts (#036 – #075)

36. `elementor_get_page_ast` — Retrieve the full parsed JSON Abstract Syntax Tree of an Elementor page.
37. `elementor_set_page_ast` — Replace complete Elementor document AST with validation and snapshotting.
38. `elementor_create_container` — Insert a modern Flexbox or CSS Grid Container with directional flow.
39. `elementor_update_container` — Update container flex properties (wrap, justify, align, gap, padding, margin).
40. `elementor_delete_container` — Remove a container node and all child elements from the AST.
41. `elementor_add_widget` — Insert any standard Elementor widget (Heading, Text, Button, Image, etc.) into a container.
42. `elementor_update_widget` — Modify widget settings, content controls, and style properties.
43. `elementor_delete_widget` — Delete a specific widget node by widget ID.
44. `elementor_reorder_nodes` — Move, reorder, or swap positions of widgets or containers inside the tree.
45. `elementor_duplicate_node` — Clone an existing container or widget with new unique UUIDs.
46. `elementor_build_hero_section` — Compound tool: Generates a complete modern hero section with CTA and responsive layouts.
47. `elementor_build_pricing_table` — Compound tool: Generates a 3-tier pricing comparison container.
48. `elementor_build_feature_grid` — Compound tool: Generates a 3-column responsive icon feature grid.
49. `elementor_build_faq_accordion` — Compound tool: Generates a searchable FAQ accordion with schema data.
50. `elementor_build_testimonial_carousel` — Compound tool: Generates customer testimonial slider cards.
51. `elementor_build_contact_section` — Compound tool: Generates a split layout with contact info and working form.
52. `elementor_build_cta_banner` — Compound tool: Generates high-converting promotional alert/CTA containers.
53. `elementor_build_team_grid` — Compound tool: Generates team member cards with social link overlays.
54. `elementor_build_stats_counter` — Compound tool: Generates animated milestone and statistics counters.
55. `elementor_set_responsive_styles` — Apply device-specific styles (Desktop, Tablet, Mobile) to any node.
56. `elementor_set_flex_alignment` — Set flex-direction, align-items, justify-content, and flex-grow.
57. `elementor_set_grid_structure` — Configure CSS Grid columns, rows, auto-flow, and responsive fr units.
58. `elementor_set_background_media` — Set image, video, gradient, or slideshow background on a container.
59. `elementor_set_border_and_shadow` — Apply border-radius, box-shadows, and border styles to elements.
60. `elementor_set_motion_effects` — Configure entrance animations, scrolling effects, and mouse track effects.
61. `elementor_set_custom_attributes` — Attach custom HTML attributes (`data-*`, `aria-*`, `rel`, `id`) to widgets.
62. `elementor_inject_custom_css` — Add custom scoped or element-level CSS rules to an Elementor node.
63. `elementor_validate_ast` — Pre-flight validation verifying that an AST tree passes Elementor parser rules.
64. `elementor_canvas_live_sync` — Trigger immediate DOM injection into active Elementor editor canvas window.
65. `elementor_get_widget_controls` — Introspect all available controls and default values for a given widget type.
66. `elementor_search_templates` — Search local and cloud Elementor template libraries by keyword/category.
67. `elementor_import_template` — Import and insert an Elementor block or page template into current document.
68. `elementor_save_as_template` — Save an existing container tree as a reusable Elementor template.
69. `elementor_export_template` — Export an Elementor template as a portable `.json` payload.
70. `elementor_clear_css_cache` — Purge and regenerate external Post-CSS stylesheets for the page.
71. `elementor_convert_sections_to_containers` — Migrate legacy Section/Column data structures to modern Flexbox Containers.
72. `elementor_find_and_replace_text` — Batch search and replace text strings across all widgets in a page.
73. `elementor_find_and_replace_links` — Update URLs and link targets across all button and image widgets.
74. `elementor_optimize_dom_depth` — Analyze container nesting depth and flatten unnecessary wrapper nodes.
75. `elementor_render_preview_html` — Generate server-rendered HTML preview of an AST without saving to DB.

---

## Category 3: Elementor Global Kits, Styling & Design Tokens (#076 – #100)

76. `elementor_get_global_kit` — Fetch the active Elementor Global Kit settings (Colors, Fonts, Theme Styles).
77. `elementor_get_global_colors` — List all registered System and Custom Global Color tokens and hex codes.
78. `elementor_add_global_color` — Register a new Global Color token (e.g., `Brand-Accent`, `#6366F1`).
79. `elementor_update_global_color` — Update existing Global Color values across the entire website.
80. `elementor_delete_global_color` — Remove a custom Global Color token safely.
81. `elementor_get_global_typography` — List all Global Typography tokens (Family, Size, Weight, Line-Height).
82. `elementor_add_global_typography` — Register a new Global Typography preset (e.g., `Heading-Hero-XL`).
83. `elementor_update_global_typography` — Modify font family, font weight, letter spacing, or line height globally.
84. `elementor_delete_global_typography` — Remove a custom typography token safely.
85. `elementor_bind_global_style` — Bind an element's color or typography property to a Global Kit token ID.
86. `elementor_unbind_global_style` — Detach global token and convert element styling to inline values.
87. `elementor_get_theme_styles` — Read global default styles for HTML tags (`h1`-`h6`, `p`, `button`, `form`, `img`).
88. `elementor_update_theme_styles` — Update site-wide typography and color defaults for standard HTML tags.
89. `elementor_get_active_breakpoints` — Inspect configured responsive breakpoints (Mobile, Tablet, Widescreen).
90. `elementor_set_custom_breakpoints` — Add or modify custom responsive breakpoint pixel thresholds.
91. `elementor_set_global_layout_settings` — Configure default container width, page gap, and content width.
92. `elementor_set_global_lightbox_settings` — Configure site-wide image lightbox behavior and styling.
93. `elementor_import_design_system` — Apply a complete JSON-defined design system (Colors + Typography) in 1 call.
94. `elementor_export_design_system` — Export the site's active Global Kit as a reusable design token schema.
95. `elementor_audit_style_consistency` — Audit page elements to find hardcoded inline colors not using Global Kits.
96. `elementor_autofix_style_tokens` — Automatically map hardcoded colors to the closest matching Global Kit token.
97. `elementor_set_global_custom_css` — Manage site-wide custom CSS injected via the Theme Style settings.
98. `elementor_get_custom_fonts` — List custom uploaded web fonts (WOFF2/TTF) registered on the site.
99. `elementor_upload_custom_font` — Register and upload new custom web font families and weight files.
100.  `elementor_sync_google_fonts` — Refresh and optimize local hosting of Google Font families.

---

## Category 4: Elementor Theme Builder & Dynamic Data (#101 – #120)

101. `elementor_list_theme_templates` — List all Theme Builder templates (Header, Footer, Single Post, Archive, 404).
102. `elementor_create_header_template` — Create a global site header template with navigation and site logo.
103. `elementor_create_footer_template` — Create a global site footer template with widgets and copyright text.
104. `elementor_create_single_template` — Create a Single Post/Page/CPT layout template with dynamic data.
105. `elementor_create_archive_template` — Create an Archive/Category layout template with Loop Grids.
106. `elementor_create_404_template` — Create a custom 404 Not Found error page template.
107. `elementor_create_popup_template` — Create an interactive popup with modal triggers and entrance effects.
108. `elementor_set_display_conditions` — Configure template display conditions (e.g., `Entire Site`, `In Category: News`).
109. `elementor_get_display_conditions` — Inspect active display condition rules across all theme templates.
110. `elementor_bind_dynamic_tag` — Bind a widget property to a dynamic tag (Post Title, Author, Date, Postmeta).
111. `elementor_bind_acf_field` — Bind widget content to an Advanced Custom Fields (ACF) field key.
112. `elementor_bind_pods_field` — Bind widget content to a Pods framework custom field.
113. `elementor_create_loop_item` — Create a Loop Item template for dynamic query grid rendering.
114. `elementor_configure_loop_grid` — Configure Loop Grid widget query parameters, pagination, and columns.
115. `elementor_set_popup_triggers` — Configure popup triggers (On Page Load, On Scroll, On Exit Intent, Inactivity).
116. `elementor_set_popup_timing_rules` — Set timing rules (Show after X page views, show once per session).
117. `elementor_test_template_rendering` — Test-render a theme template against a specific post ID preview.
118. `elementor_delete_theme_template` — Safely remove a Theme Builder template and unbind its conditions.
119. `elementor_duplicate_theme_template` — Clone an existing theme template with fresh conditions.
120. `elementor_export_theme_builder_bundle` — Export complete Theme Builder suite (Header + Footer + Single + Archive).

---

## Category 5: WooCommerce Catalog, Products & Variations (#121 – #155)

121. `woo_get_product` — Retrieve complete product record (price, SKU, stock, variants, attributes, images).
122. `woo_create_simple_product` — Create a simple product with regular price, sale price, SKU, and description.
123. `woo_create_variable_product` — Create a variable product with configurable global/custom attributes.
124. `woo_create_product_variation` — Add a specific SKU/price variation node to a parent variable product.
125. `woo_update_product` — Update product details, pricing, inventory flags, categories, and tags.
126. `woo_delete_product` — Trash or permanently delete a WooCommerce product.
127. `woo_batch_create_products` — Bulk import/create up to 50 products in a single high-speed transaction.
128. `woo_batch_update_products` — Bulk update prices, categories, or stock across products matching a query.
129. `woo_query_products` — Advanced querying by price range, taxonomy, stock status, and rating.
130. `woo_set_product_sale` — Schedule a flash sale with start and end timestamps and discount prices.
131. `woo_end_product_sale` — Immediately terminate an active product sale and restore regular prices.
132. `woo_set_product_images` — Assign primary featured image and product gallery attachments.
133. `woo_manage_product_attributes` — Create and assign custom product attributes (Size, Color, Material).
134. `woo_get_product_categories` — List all WooCommerce product categories, parent trees, and thumbnail images.
135. `woo_create_product_category` — Create a new product category with image and SEO slug.
136. `woo_update_product_category` — Update product category metadata, display type, and descriptions.
137. `woo_delete_product_category` — Delete product category and reassign child products.
138. `woo_get_product_tags` — List all product tags and associated product counts.
139. `woo_create_product_tag` — Create new product search tags.
140. `woo_set_cross_sells` — Configure cross-sell product recommendations for cart page upselling.
141. `woo_set_up_sells` — Configure upsell product recommendations for single product pages.
142. `woo_get_grouped_products` — Manage bundled and grouped product packages.
143. `woo_create_grouped_product` — Create a master grouped product and assign child simple products.
144. `woo_create_external_product` — Create an affiliate / external product with custom buy URL and button text.
145. `woo_manage_downloadable_files` — Attach downloadable digital assets (PDFs, ZIPs) with download limits.
146. `woo_set_tax_status` — Configure product tax class (Standard, Reduced Rate, Zero Rate).
147. `woo_set_shipping_class` — Assign product shipping dimensions, weight, and shipping classes.
148. `woo_get_featured_products` — Query and flag products as "Featured" for homepage grids.
149. `woo_toggle_product_visibility` — Change catalog visibility (Shop & Search, Shop Only, Hidden).
150. `woo_duplicate_product` — Clone an existing product including all variations and attributes.
151. `woo_elementor_create_shop_page` — Build a custom Elementor Archive-Product page with filters and loop grids.
152. `woo_elementor_create_product_page` — Build a custom Elementor Single-Product page layout with dynamic tags.
153. `woo_elementor_create_cart_page` — Build a custom Elementor Cart page with upsell container widgets.
154. `woo_elementor_create_checkout_page` — Build a high-converting custom Elementor Checkout page layout.
155. `woo_elementor_create_my_account_page` — Build a modern customized Elementor My Account customer dashboard.

---

## Category 6: WooCommerce Orders, Customers, Inventory & Coupons (#156 – #180)

156. `woo_get_order` — Retrieve full order details (items, billing/shipping address, status, fees, totals).
157. `woo_update_order_status` — Update order status (Processing, Completed, On-Hold, Refunded, Cancelled).
158. `woo_add_order_note` — Add private internal note or customer-visible order status update.
159. `woo_create_refund` — Process full or partial order refund with automatic stock restoration.
160. `woo_query_orders` — Query orders by date range, customer ID, status, payment method, or total.
161. `woo_batch_update_orders` — Bulk update statuses across multiple orders in one operation.
162. `woo_get_stock_inventory` — Query low-stock, out-of-stock, and backordered product inventory.
163. `woo_update_stock_quantity` — Update real-time inventory quantity and manage stock flags.
164. `woo_batch_update_stock` — High-speed inventory balance update across hundreds of SKUs.
165. `woo_get_coupons` — List all active discount coupons, expiration dates, and usage stats.
166. `woo_create_coupon` — Create a discount coupon (Percentage, Fixed Cart, Fixed Product) with rules.
167. `woo_update_coupon` — Update coupon discount amount, expiration date, or usage limits.
168. `woo_delete_coupon` — Deactivate or remove a discount coupon code.
169. `woo_batch_create_coupons` — Generate batches of unique single-use promotional coupon codes.
170. `woo_get_customer` — Retrieve customer profile, lifetime value (LTV), total orders, and saved addresses.
171. `woo_query_customers` — Segment customers by order count, total spend, or registration date.
172. `woo_update_customer` — Update customer billing, shipping, or marketing preferences.
173. `woo_get_store_analytics` — Query store performance metrics (Gross Sales, Net Sales, Orders, AOV, Refunds).
174. `woo_get_top_selling_products` — Query top-selling products by quantity and revenue over a timeframe.
175. `woo_get_low_stock_alerts` — Query all items currently breaching their minimum stock threshold.
176. `woo_set_store_notice` — Configure site-wide promotional banner text displayed at top of storefront.
177. `woo_manage_shipping_zones` — Inspect and configure shipping zones, methods (Flat Rate, Free), and rates.
178. `woo_manage_payment_gateways` — Inspect status and configuration of enabled payment gateways.
179. `woo_export_order_csv` — Generate formatted CSV export of orders for accounting/fulfillment.
180. `woo_export_customer_csv` — Generate customer export list for CRM and email marketing sync.

---

## Category 7: Media, Asset Optimization & Content Assets (#181 – #195)

181. `wp_get_media_item` — Fetch media attachment metadata (URLs, dimensions, MIME type, alt text).
182. `wp_upload_media_from_url` — Sideload and attach an image/video from a public URL into the media library.
183. `wp_upload_media_base64` — Upload a base64-encoded image directly into the WordPress upload directory.
184. `wp_update_media_metadata` — Update image Title, Alt Text, Caption, and Description for SEO.
185. `wp_delete_media_item` — Delete an attachment file and purge all generated thumbnail sizes.
186. `wp_batch_update_image_alts` — High-speed AI generation and update of missing alt texts across the library.
187. `wp_generate_image_thumbnails` — Trigger regeneration of missing WordPress image thumbnail sizes.
188. `wp_query_media_library` — Search media library by file type, unattached status, date, or keyword.
189. `wp_optimize_image_assets` — Trigger WebP/AVIF conversion or lossless compression on uploaded media.
190. `wp_upload_svg_asset` — Sanitize and upload SVG vector graphics safely into the media library.
191. `wp_get_unattached_media` — Find orphaned media files not currently embedded in any post or page.
192. `wp_replace_attachment_file` — Replace an existing media file in-place without altering its attachment URL.
193. `wp_attach_media_to_post` — Set attachment parent post ID or assign as featured post thumbnail.
194. `wp_clean_unused_media` — Bulk purge orphaned media attachments with backup safety verification.
195. `wp_download_remote_assets` — Crawl external image URLs embedded in post content and localize them into WP.

---

## Category 8: SEO, Metadata, Taxonomies & Schema Markup (#196 – #210)

196. `seo_get_page_meta` — Read meta title, meta description, canonical URL, and OpenGraph tags.
197. `seo_update_page_meta` — Set meta title, description, and social preview tags (compatible with Yoast/RankMath/AIOSEO).
198. `seo_inject_json_ld_schema` — Inject custom JSON-LD structured data (Article, Product, FAQ, Organization).
199. `seo_validate_schema_markup` — Validate JSON-LD syntax against official Schema.org standards.
200. `seo_audit_page_headings` — Audit H1-H6 heading hierarchy on a page to ensure single H1 and proper nesting.
201. `seo_audit_broken_links` — Scan page content for 404 dead links and insecure HTTP resources.
202. `seo_get_robots_settings` — Inspect `robots.txt` configuration and page-level `noindex`/`nofollow` directives.
203. `seo_set_robots_directives` — Apply `noindex`, `nofollow`, `noarchive`, or `nosnippet` flags to a post.
204. `seo_get_sitemap_index` — Inspect XML sitemap structure and verify post inclusion rules.
205. `seo_generate_breadcrumbs_markup` — Generate structured breadcrumb trail schema for custom page hierarchies.
206. `seo_audit_image_alt_coverage` — Report percentage of images on a page lacking descriptive alt text.
207. `seo_set_opengraph_image` — Set dedicated social share preview image (Facebook/Twitter cards).
208. `seo_set_canonical_url` — Override default canonical URL to resolve duplicate content issues.
209. `seo_analyze_content_readability` — Calculate Flesch-Kincaid reading score and paragraph length statistics.
210. `seo_generate_faq_schema_from_page` — Automatically extract FAQ accordion widgets and build FAQPage Schema.

---

## Category 9: Site Operations, DB, WP-CLI & Cache Performance (#211 – #225)

211. `site_get_system_health` — Inspect PHP version, MySQL version, memory limits, and server runtime health.
212. `site_run_wp_cli_command` — Execute sandboxed WP-CLI commands via secure administrative bridge.
213. `site_flush_object_cache` — Flush Redis / Memcached / WordPress transient object caches.
214. `site_flush_page_cache` — Flush WP Rocket / LiteSpeed / W3 Total Cache / Cloudflare page caches.
215. `site_list_plugins` — List all installed plugins, active statuses, version numbers, and update availability.
216. `site_toggle_plugin_state` — Activate or deactivate a specific WordPress plugin safely.
217. `site_list_themes` — List installed WordPress themes and identify the active child/parent theme.
218. `site_get_php_error_log` — Inspect recent entries in `debug.log` to troubleshoot runtime notices/errors.
219. `site_optimize_database_tables` — Run table optimization and defragmentation on `$wpdb` core tables.
220. `site_clean_transients` — Purge expired transients and orphaned postmeta rows from the database.
221. `site_get_cron_jobs` — List scheduled WP-Cron events, next run times, and hook associations.
222. `site_run_cron_job` — Force immediate execution of a scheduled WP-Cron hook.
223. `site_delete_cron_job` — Unschedule a runaway or broken background cron event.
224. `site_benchmark_page_speed` — Perform internal TTFB and DOM rendering latency benchmark on a target URL.
225. `site_check_ssl_and_headers` — Verify SSL certificate validity, HTTPS redirection, and security headers.

---

## Category 10: Multi-Site, Security, Licensing & Rollback (#226 – #240)

226. `craftor_create_snapshot` — Capture a full transactional snapshot (`wp_posts`, `_elementor_data`, meta) with UUID.
227. `craftor_restore_snapshot` — Instantly roll back a page or site state to a specific snapshot UUID.
228. `craftor_list_snapshots` — List all stored snapshots, timestamps, author IDs, and modified post IDs.
229. `craftor_get_visual_diff` — Generate JSON/visual diff payload comparing pre-mutation and post-mutation states.
230. `craftor_get_activity_log` — Query audit logs for recent AI prompts, tool calls, execution times, and callers.
231. `craftor_verify_license` — Validate Craftor license key, active seats, and cloud entitlement tier.
232. `craftor_rotate_mcp_token` — Invalidate current MCP auth token and generate a fresh cryptographically signed key.
233. `craftor_set_tool_permissions` — Restrict or allow specific MCP tools based on user roles and security tiers.
234. `craftor_get_token_usage_stats` — Retrieve token consumption, cost metrics, and AI request counts.
235. `multisite_list_network_sites` — (WPMU) List all network subsites, domain mappings, and active statuses.
236. `multisite_switch_active_site` — (WPMU) Switch execution context to a target subsite by blog ID.
237. `multisite_batch_dispatch_tool` — (WPMU) Execute a tool call across multiple or all network subsites simultaneously.
238. `multisite_sync_global_template` — (WPMU) Push a master Elementor template across 100+ network subsites.
239. `craftor_check_for_updates` — Check Craftor OTA update server for signed plugin updates and changelogs.
240. `craftor_trigger_ota_update` — Execute cryptographically verified in-place update of `craftor-core` plugin.
