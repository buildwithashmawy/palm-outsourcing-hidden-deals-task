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
define('HD_VERSION', '0.1.0');

function hd_api_url() {
    return apply_filters('hidden_deals_api_url', 'http://localhost:3000');
}

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
    echo '<div class="wrap"><div id="hidden-deals-root" data-api-url="' . esc_url(hd_api_url()) . '"></div></div>';
}

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_hidden-deals') {
        return;
    }
    $build = HD_PLUGIN_URL . 'build/';

    wp_enqueue_style('hidden-deals', $build . 'hidden-deals.css', [], HD_VERSION);
    wp_enqueue_script('hidden-deals', $build . 'hidden-deals.js', [], HD_VERSION, true);

    wp_localize_script('hidden-deals', 'HiddenDeals', [
        'apiUrl' => hd_api_url(),
        'nonce'  => wp_create_nonce('hidden_deals'),
    ]);
});

// Vite ships ES modules; WP enqueues as classic scripts by default.
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    if ($handle !== 'hidden-deals') {
        return $tag;
    }
    return '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>' . "\n";
}, 10, 3);

add_filter('plugin_action_links_' . plugin_basename(HD_PLUGIN_FILE), function ($links) {
    $url = admin_url('admin.php?page=hidden-deals');
    array_unshift($links, '<a href="' . esc_url($url) . '">Open dashboard</a>');
    return $links;
});
