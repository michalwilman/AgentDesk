<?php
/**
 * AgentDesk Heartbeat Handler
 * 
 * Sends periodic heartbeat signals to the AgentDesk backend
 * to maintain WordPress connection status and sync plugin information.
 * 
 * @package AgentDesk_Chatbot
 * @since 1.1.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class AgentDesk_Heartbeat {
    
    /**
     * Heartbeat interval in seconds (5 minutes)
     */
    const HEARTBEAT_INTERVAL = 300; // 5 minutes
    
    /**
     * Cron hook name
     */
    const CRON_HOOK = 'agentdesk_heartbeat_event';
    
    /**
     * Initialize heartbeat functionality
     */
    public function __construct() {
        // Register cron schedule
        add_filter('cron_schedules', [$this, 'add_cron_interval']);
        
        // Schedule heartbeat if not already scheduled
        if (!wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(time(), 'five_minutes', self::CRON_HOOK);
        }
        
        // Hook the heartbeat function
        add_action(self::CRON_HOOK, [$this, 'send_heartbeat']);
        
        // Send immediate heartbeat on plugin settings save
        add_action('update_option_agentdesk_api_token', [$this, 'send_immediate_heartbeat'], 10, 2);
        
        // Clear schedule on plugin deactivation
        register_deactivation_hook(AGENTDESK_PLUGIN_DIR . 'agentdesk-chatbot.php', [$this, 'clear_scheduled_event']);
    }
    
    /**
     * Add custom cron interval (5 minutes)
     */
    public function add_cron_interval($schedules) {
        $schedules['five_minutes'] = [
            'interval' => self::HEARTBEAT_INTERVAL,
            'display'  => __('Every 5 Minutes', 'agentdesk-chatbot'),
        ];
        return $schedules;
    }
    
    /**
     * Send heartbeat to AgentDesk backend
     */
    public function send_heartbeat() {
        // Get API token
        $api_token = get_option('agentdesk_api_token');
        
        // Don't send heartbeat if no token is configured
        if (empty($api_token)) {
            return;
        }
        
        // Check if plugin is enabled
        $is_enabled = get_option('agentdesk_enabled', true);
        
        // Prepare heartbeat data
        $heartbeat_data = [
            'site_url'        => home_url(),
            'plugin_version'  => AGENTDESK_VERSION,
            'wp_version'      => get_bloginfo('version'),
            'is_active'       => (bool) $is_enabled,
        ];
        
        // Send heartbeat to backend
        $response = wp_remote_post(AGENTDESK_API_URL . '/bots/wordpress-heartbeat', [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Bot-Token'  => $api_token,
            ],
            'body'    => json_encode($heartbeat_data),
            'timeout' => 15,
        ]);
        
        // Log response for debugging (only in WP_DEBUG mode)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if (is_wp_error($response)) {
                error_log('AgentDesk Heartbeat Error: ' . $response->get_error_message());
            } else {
                $body = wp_remote_retrieve_body($response);
                error_log('AgentDesk Heartbeat Response: ' . $body);
            }
        }
        
        // Store last heartbeat timestamp
        update_option('agentdesk_last_heartbeat', current_time('mysql'));
    }
    
    /**
     * Send immediate heartbeat when settings are saved
     */
    public function send_immediate_heartbeat($old_value, $new_value) {
        // Only send if token changed and is not empty
        if ($old_value !== $new_value && !empty($new_value)) {
            $this->send_heartbeat();
        }
    }
    
    /**
     * Clear scheduled event on plugin deactivation
     */
    public function clear_scheduled_event() {
        $timestamp = wp_next_scheduled(self::CRON_HOOK);
        if ($timestamp) {
            wp_unschedule_event($timestamp, self::CRON_HOOK);
        }
        
        // Send final heartbeat with is_active = false
        $api_token = get_option('agentdesk_api_token');
        if (!empty($api_token)) {
            wp_remote_post(AGENTDESK_API_URL . '/bots/wordpress-heartbeat', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-Bot-Token'  => $api_token,
                ],
                'body'    => json_encode([
                    'site_url'        => home_url(),
                    'plugin_version'  => AGENTDESK_VERSION,
                    'wp_version'      => get_bloginfo('version'),
                    'is_active'       => false,
                ]),
                'timeout' => 10,
            ]);
        }
    }
    
    /**
     * Get last heartbeat timestamp
     * 
     * @return string|false Last heartbeat time or false if never sent
     */
    public static function get_last_heartbeat() {
        return get_option('agentdesk_last_heartbeat', false);
    }
    
    /**
     * Check if heartbeat is healthy (sent within last 10 minutes)
     * 
     * @return bool True if healthy, false otherwise
     */
    public static function is_healthy() {
        $last_heartbeat = self::get_last_heartbeat();
        
        if (!$last_heartbeat) {
            return false;
        }
        
        $last_time = strtotime($last_heartbeat);
        $current_time = current_time('timestamp');
        
        // Consider healthy if heartbeat was sent within last 10 minutes
        return ($current_time - $last_time) < 600;
    }
}

