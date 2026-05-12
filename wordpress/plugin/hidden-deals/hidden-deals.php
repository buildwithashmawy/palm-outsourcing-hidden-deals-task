<?php
/**
 * Plugin Name: Hidden Deals
 * Description: Admin dashboard for repossessed and priced-for-quick-sale properties.
 * Version: 0.1.0
 * Author: Mahmoud Elashmawy
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('HD_PLUGIN_FILE', __FILE__);
define('HD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('HD_PLUGIN_URL', plugin_dir_url(__FILE__));

add_action('admin_menu', function () {
    add_menu_page(
        'Hidden Deals',
        'Hidden Deals',
        'manage_options',
        'hidden-deals',
        'hd_render_page',
        'dashicons-chart-line',
        26
    );
});

function hd_render_page() {
    $api_url = apply_filters('hidden_deals_api_url', 'http://localhost:3000');
    echo '<div class="wrap"><div id="hidden-deals-root" data-api-url="' . esc_url($api_url) . '"></div></div>';
}

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_hidden-deals') {
        return;
    }
    $build = HD_PLUGIN_URL . 'build/';
    $ver = '0.1.0';

    wp_enqueue_style('hidden-deals', $build . 'hidden-deals.css', [], $ver);
    wp_enqueue_script('hidden-deals', $build . 'hidden-deals.js', [], $ver, true);

    wp_localize_script('hidden-deals', 'HiddenDeals', [
        'apiUrl' => apply_filters('hidden_deals_api_url', 'http://localhost:3000'),
        'nonce'  => wp_create_nonce('hidden_deals'),
    ]);
});

add_filter('plugin_action_links_' . plugin_basename(HD_PLUGIN_FILE), function ($links) {
    $url = admin_url('admin.php?page=hidden-deals');
    array_unshift($links, '<a href="' . esc_url($url) . '">Open dashboard</a>');
    return $links;
});
