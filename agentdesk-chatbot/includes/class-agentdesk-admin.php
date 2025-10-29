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
        
        // Validate token format
        if (!empty($token) && !preg_match('/^bot_[a-zA-Z0-9_-]{16,}$/', $token)) {
            add_settings_error(
                'agentdesk_api_token',
                'invalid_token',
                __('Invalid API token format. Token should start with "bot_" followed by alphanumeric characters.', 'agentdesk-chatbot'),
                'error'
            );
            return get_option('agentdesk_api_token'); // Return old value
        }
        
        // If token is provided, verify it with API
        if (!empty($token)) {
            $api = new AgentDesk_API();
            $is_valid = $api->verify_token($token);
            
            if (!$is_valid) {
                add_settings_error(
                    'agentdesk_api_token',
                    'invalid_token_api',
                    __('API token is invalid or bot not found. Please check your token in the AgentDesk dashboard.', 'agentdesk-chatbot'),
                    'error'
                );
                return get_option('agentdesk_api_token'); // Return old value
            } else {
                add_settings_error(
                    'agentdesk_api_token',
                    'token_verified',
                    __('API token verified successfully! Your chatbot is ready.', 'agentdesk-chatbot'),
                    'success'
                );
            }
        }
        
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
            
            <?php if (!$has_token): ?>
            <div class="notice notice-warning">
                <h3><?php _e('🚀 Get Started with AgentDesk', 'agentdesk-chatbot'); ?></h3>
                <p>
                    <?php _e('To use AgentDesk AI Chatbot, you need to:', 'agentdesk-chatbot'); ?>
                </p>
                <ol>
                    <li><?php _e('Your AgentDesk backend must be running (locally or on server)', 'agentdesk-chatbot'); ?></li>
                    <li><?php _e('Get your Bot API Token from the AgentDesk dashboard', 'agentdesk-chatbot'); ?></li>
                    <li><?php _e('If using localhost, you need ngrok or deploy to production', 'agentdesk-chatbot'); ?></li>
                    <li><?php _e('Paste the token in the field below', 'agentdesk-chatbot'); ?></li>
                </ol>
                <p>
                    <strong><?php _e('Note:', 'agentdesk-chatbot'); ?></strong>
                    <?php _e('Make sure your backend is accessible from the internet!', 'agentdesk-chatbot'); ?>
                </p>
            </div>
            <?php endif; ?>
            
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
                    <a href="http://localhost:3000" class="button button-secondary" target="_blank">
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
    }
}

