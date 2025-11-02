<?php
/**
 * AgentDesk API Validator
 * 
 * Validates bot tokens with AgentDesk API
 */

if (!defined('ABSPATH')) {
    exit;
}

class AgentDesk_Validator {
    
    /**
     * Validate bot API token
     * 
     * @param string $api_token Bot API token to validate
     * @return array Validation result with status and data
     */
    public static function validate_token($api_token) {
        if (empty($api_token)) {
            return [
                'valid' => false,
                'message' => __('Bot API Token is required', 'agentdesk-chatbot'),
            ];
        }

        // Validate token format
        if (!preg_match('/^bot_[a-f0-9]{64}$/', $api_token)) {
            return [
                'valid' => false,
                'message' => __('Invalid token format. Token should start with "bot_"', 'agentdesk-chatbot'),
            ];
        }

        // Call AgentDesk API to validate
        $api_url = defined('AGENTDESK_API_URL') ? AGENTDESK_API_URL : 'https://agentdesk-backend-production.up.railway.app/api';
        $response = wp_remote_post($api_url . '/bots/validate', [
            'method'  => 'POST',
            'timeout' => 10,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body'    => json_encode([
                'apiToken' => $api_token,
            ]),
        ]);

        // Check for connection errors
        if (is_wp_error($response)) {
            return [
                'valid' => false,
                'message' => sprintf(
                    __('Connection error: %s', 'agentdesk-chatbot'),
                    $response->get_error_message()
                ),
            ];
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        // Handle API response
        if ($status_code !== 200 && $status_code !== 201) {
            return [
                'valid' => false,
                'message' => sprintf(
                    __('API connection failed (Status: %d). Response: %s', 'agentdesk-chatbot'),
                    $status_code,
                    substr($body, 0, 200)
                ),
            ];
        }

        if (!$data || !isset($data['valid'])) {
            return [
                'valid' => false,
                'message' => __('Invalid API response', 'agentdesk-chatbot'),
            ];
        }

        if ($data['valid'] === true && isset($data['bot'])) {
            return [
                'valid' => true,
                'bot' => [
                    'id' => $data['bot']['id'],
                    'name' => $data['bot']['name'],
                    'is_active' => $data['bot']['is_active'],
                    'is_trained' => $data['bot']['is_trained'],
                    'language' => $data['bot']['language'],
                ],
                'message' => sprintf(
                    __('✅ Connected successfully to bot: %s', 'agentdesk-chatbot'),
                    $data['bot']['name']
                ),
            ];
        }

        return [
            'valid' => false,
            'message' => isset($data['message']) 
                ? $data['message'] 
                : __('Invalid or inactive bot token', 'agentdesk-chatbot'),
        ];
    }

    /**
     * Get bot info from API token
     * 
     * @param string $api_token Bot API token
     * @return array|false Bot data or false on failure
     */
    public static function get_bot_info($api_token) {
        $result = self::validate_token($api_token);
        
        if ($result['valid'] && isset($result['bot'])) {
            return $result['bot'];
        }
        
        return false;
    }
}

