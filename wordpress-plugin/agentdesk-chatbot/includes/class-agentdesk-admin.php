<?php
/**
 * Admin Panel Handler
 * Manages the WordPress admin settings page
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AgentDesk_Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_notices', [$this, 'show_admin_notices']);
        add_filter('plugin_row_meta', [$this, 'add_plugin_row_meta'], 10, 2);
        add_action('wp_ajax_agentdesk_check_updates', [$this, 'ajax_check_updates']);
    }
    
    /**
     * Add admin menu item
     */
    public function add_admin_menu() {
        add_menu_page(
            __('AgentDesk Settings', 'agentdesk-chatbot'),
            __('AgentDesk', 'agentdesk-chatbot'),
            'manage_options',
            'agentdesk',
            [$this, 'render_settings_page'],
            'dashicons-format-chat',
            100
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('agentdesk_settings', 'agentdesk_api_token', [
            'type' => 'string',
            'sanitize_callback' => [$this, 'sanitize_api_token'],
        ]);
        
        register_setting('agentdesk_settings', 'agentdesk_position', [
            'type' => 'string',
            'default' => 'bottom-right',
        ]);
        
        register_setting('agentdesk_settings', 'agentdesk_enabled', [
            'type' => 'boolean',
            'default' => true,
        ]);
        
        register_setting('agentdesk_settings', 'agentdesk_display_pages', [
            'type' => 'string',
            'default' => 'all',
        ]);
    }
    
    /**
     * Sanitize and validate API token
     */
    public function sanitize_api_token($token) {
        $token = sanitize_text_field($token);
        
        // If empty, just return it
        if (empty($token)) {
            return $token;
        }
        
        // Validate token with API
        $validation = AgentDesk_Validator::validate_token($token);
        
        if (!$validation['valid']) {
            add_settings_error(
                'agentdesk_api_token',
                'invalid_token_api',
                '❌ ' . $validation['message'],
                'error'
            );
            return get_option('agentdesk_api_token'); // Return old value
        }
        
        // Token is valid - show success message with bot info
        $bot_info = isset($validation['bot']) ? $validation['bot'] : [];
        $bot_name = isset($bot_info['name']) ? $bot_info['name'] : 'Unknown';
        $is_trained = isset($bot_info['is_trained']) && $bot_info['is_trained'];
        
        $success_message = sprintf(
            __('✅ Connected successfully to bot: <strong>%s</strong>', 'agentdesk-chatbot'),
            $bot_name
        );
        
        if (!$is_trained) {
            $success_message .= '<br>' . __('⚠️ Note: This bot is not trained yet. Please train it in your AgentDesk dashboard.', 'agentdesk-chatbot');
        }
        
        add_settings_error(
            'agentdesk_api_token',
            'token_verified',
            $success_message,
            'success'
        );
        
        // Store bot info in option for dashboard display
        update_option('agentdesk_bot_info', $bot_info);
        
        return $token;
    }
    
    /**
     * Show admin notices
     */
    public function show_admin_notices() {
        // Show setup notice if token is not configured
        if (empty(get_option('agentdesk_api_token'))) {
            $screen = get_current_screen();
            if ($screen && $screen->id !== 'toplevel_page_agentdesk') {
                ?>
                <div class="notice notice-info is-dismissible">
                    <p>
                        <strong><?php _e('AgentDesk AI Chatbot', 'agentdesk-chatbot'); ?></strong> - 
                        <?php _e('Almost ready! Please', 'agentdesk-chatbot'); ?>
                        <a href="<?php echo admin_url('admin.php?page=agentdesk'); ?>">
                            <?php _e('configure your API token', 'agentdesk-chatbot'); ?>
                        </a>
                        <?php _e('to start using the chatbot.', 'agentdesk-chatbot'); ?>
                    </p>
                </div>
                <?php
            }
        }
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'agentdesk-chatbot'));
        }
        
        $api_token = get_option('agentdesk_api_token');
        $has_token = !empty($api_token);
        ?>
        <div class="wrap agentdesk-settings">
            <h1>
                <span class="dashicons dashicons-format-chat" style="font-size: 32px; width: 32px; height: 32px;"></span>
                <?php echo esc_html(get_admin_page_title()); ?>
            </h1>
            
            <?php settings_errors(); ?>
            
            <?php if (!$has_token): ?>
            <div class="notice notice-info" style="border-left-color: #00d4aa; background: #f0fdf9;">
                <h2 style="color: #1a1a1a; margin-top: 0.5em;">
                    🎉 <?php _e('Welcome to AgentDesk!', 'agentdesk-chatbot'); ?>
                </h2>
                <p style="font-size: 16px; line-height: 1.6;">
                    <?php _e('Get started in just 3 simple steps:', 'agentdesk-chatbot'); ?>
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <ol style="font-size: 15px; line-height: 1.8; margin: 0;">
                        <li>
                            <strong><?php _e('Create a FREE account', 'agentdesk-chatbot'); ?></strong>
                            <br>
                            <span style="color: #666;">
                                <?php _e('Get 7 days free trial - No credit card required!', 'agentdesk-chatbot'); ?>
                            </span>
                        </li>
                        <li>
                            <strong><?php _e('Create your first AI chatbot', 'agentdesk-chatbot'); ?></strong>
                            <br>
                            <span style="color: #666;">
                                <?php _e('Takes just 2 minutes. Train it on your website content.', 'agentdesk-chatbot'); ?>
                            </span>
                        </li>
                        <li>
                            <strong><?php _e('Get your Bot Token', 'agentdesk-chatbot'); ?></strong>
                            <br>
                            <span style="color: #666;">
                                <?php _e('Copy the token from your dashboard and paste it below.', 'agentdesk-chatbot'); ?>
                            </span>
                        </li>
                    </ol>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; align-items: center;">
                    <a href="https://agentdesk-frontend-production.up.railway.app/register" 
                       target="_blank" 
                       class="button button-primary button-hero"
                       style="background: linear-gradient(135deg, #00d4aa 0%, #00a887 100%); border: none; text-shadow: none; box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3); height: auto; padding: 12px 30px; font-size: 16px;">
                        <span class="dashicons dashicons-admin-users" style="margin-top: 3px;"></span>
                        <?php _e('Create Free Account', 'agentdesk-chatbot'); ?>
                    </a>
                    
                    <a href="https://agentdesk-frontend-production.up.railway.app/login" 
                       target="_blank" 
                       class="button button-secondary button-hero"
                       style="height: auto; padding: 12px 30px; font-size: 16px;">
                        <span class="dashicons dashicons-lock" style="margin-top: 3px;"></span>
                        <?php _e('I Already Have an Account', 'agentdesk-chatbot'); ?>
                    </a>
                    
                    <a href="https://github.com/michalwilman/AgentDesk#-quick-start" 
                       target="_blank" 
                       style="margin-left: auto; color: #00d4aa; text-decoration: none; font-size: 14px;">
                        <span class="dashicons dashicons-book" style="vertical-align: middle;"></span>
                        <?php _e('View Documentation', 'agentdesk-chatbot'); ?>
                    </a>
                </div>
                
                <div style="margin-top: 15px; padding: 12px; background: #e8f8f4; border-radius: 6px; border-left: 3px solid #00d4aa;">
                    <strong style="color: #00a887;">💡 <?php _e('Pro Tip:', 'agentdesk-chatbot'); ?></strong>
                    <span style="color: #333;">
                        <?php _e('Your chatbot learns from your website automatically. Just provide your URL during bot creation!', 'agentdesk-chatbot'); ?>
                    </span>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($has_token): 
                $bot_info = get_option('agentdesk_bot_info', []);
                if (!empty($bot_info)):
            ?>
            <div class="notice notice-success" style="border-left-color: #00d4aa; background: #f0fdf9; padding: 20px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">
                    ✅ <?php _e('Bot Connected', 'agentdesk-chatbot'); ?>
                </h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 12px 0; font-weight: 600; color: #555; width: 30%;">
                                <?php _e('Bot Name:', 'agentdesk-chatbot'); ?>
                            </td>
                            <td style="padding: 12px 0; color: #1a1a1a;">
                                <strong><?php echo esc_html($bot_info['name'] ?? 'N/A'); ?></strong>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 12px 0; font-weight: 600; color: #555;">
                                <?php _e('Status:', 'agentdesk-chatbot'); ?>
                            </td>
                            <td style="padding: 12px 0;">
                                <?php if (isset($bot_info['is_active']) && $bot_info['is_active']): ?>
                                    <span style="color: #00d4aa;">🟢 <?php _e('Active', 'agentdesk-chatbot'); ?></span>
                                <?php else: ?>
                                    <span style="color: #dc3232;">🔴 <?php _e('Inactive', 'agentdesk-chatbot'); ?></span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 12px 0; font-weight: 600; color: #555;">
                                <?php _e('Training Status:', 'agentdesk-chatbot'); ?>
                            </td>
                            <td style="padding: 12px 0;">
                                <?php if (isset($bot_info['is_trained']) && $bot_info['is_trained']): ?>
                                    <span style="color: #00d4aa;">✅ <?php _e('Trained', 'agentdesk-chatbot'); ?></span>
                                <?php else: ?>
                                    <span style="color: #ff9800;">⚠️ <?php _e('Not Trained', 'agentdesk-chatbot'); ?></span>
                                    <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">
                                        <?php _e('Train your bot in the AgentDesk dashboard to enable responses', 'agentdesk-chatbot'); ?>
                                    </p>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; font-weight: 600; color: #555;">
                                <?php _e('Language:', 'agentdesk-chatbot'); ?>
                            </td>
                            <td style="padding: 12px 0; color: #1a1a1a;">
                                <?php 
                                $lang = $bot_info['language'] ?? 'en';
                                echo esc_html($lang === 'he' ? 'Hebrew (עברית)' : 'English');
                                ?>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 15px;">
                    <a href="https://agentdesk-frontend-production.up.railway.app/dashboard" 
                       target="_blank" 
                       class="button button-primary"
                       style="background: linear-gradient(135deg, #00d4aa 0%, #00a887 100%); border: none; text-shadow: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <span class="dashicons dashicons-external" style="margin-top: 3px;"></span>
                        <?php _e('Manage Bot in Dashboard', 'agentdesk-chatbot'); ?>
                    </a>
                    <a href="https://agentdesk-frontend-production.up.railway.app/pricing" 
                       target="_blank" 
                       class="button"
                       style="margin-left: 10px;">
                        <span class="dashicons dashicons-star-filled" style="margin-top: 3px;"></span>
                        <?php _e('View Plans & Pricing', 'agentdesk-chatbot'); ?>
                    </a>
                </div>
            </div>
            <?php endif; endif; ?>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('agentdesk_settings');
                do_settings_sections('agentdesk_settings');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="agentdesk_api_token">
                                <?php _e('Bot API Token', 'agentdesk-chatbot'); ?>
                                <span style="color: red;">*</span>
                            </label>
                        </th>
                        <td>
                            <input 
                                type="text" 
                                id="agentdesk_api_token" 
                                name="agentdesk_api_token" 
                                value="<?php echo esc_attr($api_token); ?>" 
                                class="regular-text"
                                placeholder="bot_xxxxxxxxxxxxxxxx"
                                required
                            />
                            <p class="description">
                                <?php _e('Find your API token in the AgentDesk dashboard under Bot Settings → API Token.', 'agentdesk-chatbot'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="agentdesk_enabled">
                                <?php _e('Enable Chatbot', 'agentdesk-chatbot'); ?>
                            </label>
                        </th>
                        <td>
                            <label>
                                <input 
                                    type="checkbox" 
                                    id="agentdesk_enabled" 
                                    name="agentdesk_enabled" 
                                    value="1" 
                                    <?php checked(get_option('agentdesk_enabled'), 1); ?>
                                />
                                <?php _e('Show chatbot on your website', 'agentdesk-chatbot'); ?>
                            </label>
                            <p class="description">
                                <?php _e('Uncheck to temporarily disable the chatbot without removing your settings.', 'agentdesk-chatbot'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="agentdesk_position">
                                <?php _e('Widget Position', 'agentdesk-chatbot'); ?>
                            </label>
                        </th>
                        <td>
                            <select id="agentdesk_position" name="agentdesk_position">
                                <option value="bottom-right" <?php selected(get_option('agentdesk_position'), 'bottom-right'); ?>>
                                    <?php _e('Bottom Right', 'agentdesk-chatbot'); ?>
                                </option>
                                <option value="bottom-left" <?php selected(get_option('agentdesk_position'), 'bottom-left'); ?>>
                                    <?php _e('Bottom Left', 'agentdesk-chatbot'); ?>
                                </option>
                            </select>
                            <p class="description">
                                <?php _e('Choose where the chat widget appears on your site.', 'agentdesk-chatbot'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="agentdesk_display_pages">
                                <?php _e('Display On', 'agentdesk-chatbot'); ?>
                            </label>
                        </th>
                        <td>
                            <select id="agentdesk_display_pages" name="agentdesk_display_pages">
                                <option value="all" <?php selected(get_option('agentdesk_display_pages'), 'all'); ?>>
                                    <?php _e('All Pages', 'agentdesk-chatbot'); ?>
                                </option>
                                <option value="homepage" <?php selected(get_option('agentdesk_display_pages'), 'homepage'); ?>>
                                    <?php _e('Homepage Only', 'agentdesk-chatbot'); ?>
                                </option>
                                <option value="posts" <?php selected(get_option('agentdesk_display_pages'), 'posts'); ?>>
                                    <?php _e('Posts Only', 'agentdesk-chatbot'); ?>
                                </option>
                                <option value="pages" <?php selected(get_option('agentdesk_display_pages'), 'pages'); ?>>
                                    <?php _e('Pages Only', 'agentdesk-chatbot'); ?>
                                </option>
                            </select>
                            <p class="description">
                                <?php _e('Choose where you want the chatbot to appear.', 'agentdesk-chatbot'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(__('Save Settings', 'agentdesk-chatbot')); ?>
            </form>
            
            <?php if ($has_token): ?>
            <hr style="margin: 40px 0;">
            
            <h2><?php _e('✅ Chatbot Status', 'agentdesk-chatbot'); ?></h2>
            <div class="notice notice-success inline">
                <p>
                    <strong><?php _e('Your chatbot is active and ready!', 'agentdesk-chatbot'); ?></strong><br>
                    <?php _e('Visit your website to see the chatbot in action.', 'agentdesk-chatbot'); ?>
                </p>
                <p>
                    <a href="<?php echo home_url(); ?>" class="button button-secondary" target="_blank">
                        <?php _e('View Site', 'agentdesk-chatbot'); ?> →
                    </a>
                    <a href="https://agentdesk-frontend-production.up.railway.app/dashboard" class="button button-secondary" target="_blank">
                        <?php _e('Open AgentDesk Dashboard', 'agentdesk-chatbot'); ?> →
                    </a>
                </p>
            </div>
            
            <h2><?php _e('📊 Configuration Info', 'agentdesk-chatbot'); ?></h2>
            <p><?php _e('Important settings:', 'agentdesk-chatbot'); ?></p>
            <ul style="list-style: disc; margin-left: 20px;">
                <li>
                    <strong>API URL:</strong> 
                    <?php echo esc_html(AGENTDESK_API_URL); ?>
                </li>
                <li>
                    <strong>Widget Script:</strong> 
                    <?php echo esc_html(AGENTDESK_CDN_URL); ?>
                </li>
                <li>
                    <strong>Plugin Version:</strong> 
                    <?php echo esc_html(AGENTDESK_VERSION); ?>
                </li>
            </ul>
            <p>
                <em><?php _e('If using localhost backend, make sure to use ngrok or deploy to production server.', 'agentdesk-chatbot'); ?></em>
            </p>
            <?php endif; ?>
        </div>
        
        <style>
            .agentdesk-settings h1 .dashicons {
                color: #00E0C6;
            }
            .agentdesk-settings .notice.inline {
                display: inline-block;
                margin: 0;
                padding: 12px;
            }
        </style>
        <?php
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_agentdesk') {
            return;
        }
        
        wp_enqueue_style(
            'agentdesk-admin-styles',
            AGENTDESK_PLUGIN_URL . 'assets/css/admin-styles.css',
            [],
            AGENTDESK_VERSION
        );
        
        wp_enqueue_script(
            'agentdesk-admin-scripts',
            AGENTDESK_PLUGIN_URL . 'assets/js/admin-scripts.js',
            ['jquery'],
            AGENTDESK_VERSION,
            true
        );
        
        // Pass AJAX URL and nonce to JavaScript
        wp_localize_script('agentdesk-admin-scripts', 'agentdeskAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('agentdesk_check_updates'),
            'currentVersion' => AGENTDESK_VERSION,
        ]);
    }
    
    /**
     * Add plugin row meta with update check link
     */
    public function add_plugin_row_meta($links, $file) {
        if (plugin_basename(AGENTDESK_PLUGIN_DIR . 'agentdesk-chatbot.php') !== $file) {
            return $links;
        }
        
        $update_info = $this->get_cached_update_info();
        
        if ($update_info && isset($update_info['update_available']) && $update_info['update_available']) {
            $status = sprintf(
                '<span style="color: #d63638; font-weight: 600;">%s %s</span>',
                __('Update available:', 'agentdesk-chatbot'),
                $update_info['version']
            );
        } else {
            $status = sprintf(
                '<span style="color: #00a32a;">✓ %s</span>',
                __('Up to date', 'agentdesk-chatbot')
            );
        }
        
        $check_link = sprintf(
            '<a href="#" class="agentdesk-check-updates" style="color: #2271b1;">%s</a>',
            __('Check for updates', 'agentdesk-chatbot')
        );
        
        $row_meta = [
            'version' => sprintf(__('Version %s', 'agentdesk-chatbot'), AGENTDESK_VERSION),
            'status' => $status,
            'check' => $check_link,
        ];
        
        return array_merge($links, $row_meta);
    }
    
    /**
     * Get cached update information
     */
    private function get_cached_update_info() {
        $cache_key = 'agentdesk_update_check_' . AGENTDESK_VERSION;
        $cached = get_transient($cache_key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        // If no cache, check now
        return $this->check_for_updates();
    }
    
    /**
     * Check for plugin updates
     */
    private function check_for_updates() {
        $api_url = defined('AGENTDESK_API_URL') 
            ? AGENTDESK_API_URL 
            : 'https://agentdesk-backend-production.up.railway.app/api';
        
        $response = wp_remote_get(
            $api_url . '/wordpress/plugin-update?version=' . AGENTDESK_VERSION,
            [
                'timeout' => 10,
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ]
        );
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data) {
            return false;
        }
        
        // Cache for 1 hour
        $cache_key = 'agentdesk_update_check_' . AGENTDESK_VERSION;
        set_transient($cache_key, $data, HOUR_IN_SECONDS);
        
        // Also update the last check time
        update_option('agentdesk_last_update_check', current_time('mysql'));
        
        return $data;
    }
    
    /**
     * AJAX handler for checking updates
     */
    public function ajax_check_updates() {
        check_ajax_referer('agentdesk_check_updates', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied', 'agentdesk-chatbot')]);
        }
        
        // Clear cache to force fresh check
        $cache_key = 'agentdesk_update_check_' . AGENTDESK_VERSION;
        delete_transient($cache_key);
        
        $update_info = $this->check_for_updates();
        
        if (!$update_info) {
            wp_send_json_error(['message' => __('Failed to check for updates', 'agentdesk-chatbot')]);
        }
        
        wp_send_json_success([
            'update_available' => $update_info['update_available'] ?? false,
            'current_version' => AGENTDESK_VERSION,
            'latest_version' => $update_info['version'] ?? AGENTDESK_VERSION,
            'message' => $update_info['update_available'] 
                ? sprintf(__('Update available: %s', 'agentdesk-chatbot'), $update_info['version'])
                : __('You have the latest version!', 'agentdesk-chatbot'),
            'last_checked' => get_option('agentdesk_last_update_check', ''),
        ]);
    }
}

