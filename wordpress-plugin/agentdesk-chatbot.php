<?php
/**
 * Plugin Name: AgentDesk AI Chatbot
 * Plugin URI: https://agentdesk.com/wordpress
 * Description: Add intelligent AI chatbot to your WordPress site. Trained on your content, powered by GPT-4.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: AgentDesk
 * Author URI: https://agentdesk.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: agentdesk-chatbot
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('AGENTDESK_VERSION', '1.0.0');
define('AGENTDESK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AGENTDESK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');

// Load dependencies with error checking
$required_files = [
    'includes/class-agentdesk-admin.php',
    'includes/class-agentdesk-widget.php',
    'includes/class-agentdesk-api.php',
];

foreach ($required_files as $file) {
    $file_path = AGENTDESK_PLUGIN_DIR . $file;
    if (file_exists($file_path)) {
        require_once $file_path;
    } else {
        add_action('admin_notices', function() use ($file) {
            echo '<div class="error"><p>AgentDesk Error: Missing file - ' . esc_html($file) . '</p></div>';
        });
        return;
    }
}

/**
 * Initialize plugin
 */
function agentdesk_init() {
    // Load translations
    load_plugin_textdomain('agentdesk-chatbot', false, dirname(plugin_basename(__FILE__)) . '/languages');
    
    // Initialize admin panel
    if (is_admin()) {
        new AgentDesk_Admin();
    }
    
    // Initialize widget on frontend
    if (!is_admin()) {
        new AgentDesk_Widget();
    }
}
add_action('plugins_loaded', 'agentdesk_init');

/**
 * Activation hook
 */
register_activation_hook(__FILE__, 'agentdesk_activate');
function agentdesk_activate() {
    // Set default options
    add_option('agentdesk_api_token', '');
    add_option('agentdesk_position', 'bottom-right');
    add_option('agentdesk_enabled', true);
    add_option('agentdesk_display_pages', 'all'); // all, homepage, posts, pages, custom
    add_option('agentdesk_custom_pages', ''); // comma-separated page IDs
    
    // Create options if they don't exist
    if (get_option('agentdesk_api_token') === false) {
        update_option('agentdesk_api_token', '');
    }
}

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, 'agentdesk_deactivate');
function agentdesk_deactivate() {
    // Optional: cleanup temporary data
}

/**
 * Uninstall hook
 */
register_uninstall_hook(__FILE__, 'agentdesk_uninstall');
function agentdesk_uninstall() {
    // Remove all plugin options
    delete_option('agentdesk_api_token');
    delete_option('agentdesk_position');
    delete_option('agentdesk_enabled');
    delete_option('agentdesk_display_pages');
    delete_option('agentdesk_custom_pages');
}

/**
 * Add settings link on plugin page
 */
function agentdesk_add_settings_link($links) {
    $settings_link = '<a href="admin.php?page=agentdesk">' . __('Settings', 'agentdesk-chatbot') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'agentdesk_add_settings_link');

