<?php
/**
 * API Communication Handler
 * Handles communication with AgentDesk API
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AgentDesk_API {
    
    private $api_url;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->api_url = AGENTDESK_API_URL;
    }
    
    /**
     * Verify API token
     * 
     * @param string $token API token to verify
     * @return bool True if token is valid, false otherwise
     */
    public function verify_token($token) {
        if (empty($token)) {
            return false;
        }
        
        // Make API request to verify token
        $response = wp_remote_get(
            $this->api_url . '/bots/config/' . $token,
            [
                'timeout' => 10,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'AgentDesk-WordPress-Plugin/' . AGENTDESK_VERSION,
                ],
            ]
        );
        
        // Check for errors
        if (is_wp_error($response)) {
            error_log('AgentDesk API Error: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        // Token is valid if we get 200 OK
        return $status_code === 200;
    }
    
    /**
     * Get bot configuration
     * 
     * @param string $token API token
     * @return array|false Bot configuration or false on failure
     */
    public function get_bot_config($token) {
        if (empty($token)) {
            return false;
        }
        
        $response = wp_remote_get(
            $this->api_url . '/bots/config/' . $token,
            [
                'timeout' => 10,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'AgentDesk-WordPress-Plugin/' . AGENTDESK_VERSION,
                ],
            ]
        );
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data;
    }
    
    /**
     * Test API connection
     * 
     * @return bool True if API is reachable, false otherwise
     */
    public function test_connection() {
        $response = wp_remote_get(
            $this->api_url . '/health',
            [
                'timeout' => 5,
            ]
        );
        
        if (is_wp_error($response)) {
            return false;
        }
        
        return wp_remote_retrieve_response_code($response) === 200;
    }
}

