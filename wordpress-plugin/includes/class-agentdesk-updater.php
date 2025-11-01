<?php
/**
 * AgentDesk Auto-Updater
 * 
 * Checks for plugin updates and notifies WordPress
 */

if (!defined('ABSPATH')) {
    exit;
}

class AgentDesk_Updater {
    
    private $plugin_slug;
    private $plugin_basename;
    private $version;
    private $cache_key;
    private $cache_allowed;
    
    /**
     * Constructor
     */
    public function __construct($plugin_basename, $version) {
        $this->plugin_slug = 'agentdesk-chatbot';
        $this->plugin_basename = $plugin_basename;
        $this->version = $version;
        $this->cache_key = 'agentdesk_update_' . $version;
        $this->cache_allowed = true;
        
        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_update']);
        add_filter('plugins_api', [$this, 'plugin_info'], 20, 3);
        add_filter('upgrader_post_install', [$this, 'after_install'], 10, 3);
    }
    
    /**
     * Check for plugin updates
     */
    public function check_update($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }
        
        $remote = $this->request();
        
        if (
            $remote &&
            isset($remote->version) &&
            isset($remote->download_url) &&
            version_compare($this->version, $remote->version, '<')
        ) {
            $res = new stdClass();
            $res->slug = $this->plugin_slug;
            $res->plugin = $this->plugin_basename;
            $res->new_version = $remote->version;
            $res->tested = $remote->tested;
            $res->package = $remote->download_url;
            $res->url = isset($remote->homepage) ? $remote->homepage : '';
            
            $transient->response[$this->plugin_basename] = $res;
        }
        
        return $transient;
    }
    
    /**
     * Get plugin information for WordPress
     */
    public function plugin_info($res, $action, $args) {
        // Only handle plugin_information action for our plugin
        if ($action !== 'plugin_information') {
            return $res;
        }
        
        if ($args->slug !== $this->plugin_slug) {
            return $res;
        }
        
        $remote = $this->request();
        
        if (!$remote) {
            return $res;
        }
        
        $res = new stdClass();
        $res->name = isset($remote->name) ? $remote->name : 'AgentDesk AI Chatbot';
        $res->slug = $this->plugin_slug;
        $res->version = isset($remote->version) ? $remote->version : $this->version;
        $res->tested = isset($remote->tested) ? $remote->tested : '6.4';
        $res->requires = isset($remote->requires) ? $remote->requires : '5.8';
        $res->requires_php = isset($remote->requires_php) ? $remote->requires_php : '7.4';
        $res->author = '<a href="https://agentdesk.com">AgentDesk</a>';
        $res->author_profile = 'https://agentdesk.com';
        $res->download_link = isset($remote->download_url) ? $remote->download_url : '';
        $res->trunk = isset($remote->download_url) ? $remote->download_url : '';
        $res->last_updated = isset($remote->last_updated) ? $remote->last_updated : date('Y-m-d');
        $res->sections = [
            'description' => isset($remote->sections->description) 
                ? $remote->sections->description 
                : 'Add intelligent AI chatbot to your WordPress site.',
            'changelog' => isset($remote->sections->changelog) 
                ? $remote->sections->changelog 
                : '<h4>Version ' . $this->version . '</h4><p>Initial release.</p>',
        ];
        
        if (isset($remote->banners)) {
            $res->banners = [
                'low' => isset($remote->banners->low) ? $remote->banners->low : '',
                'high' => isset($remote->banners->high) ? $remote->banners->high : '',
            ];
        }
        
        if (isset($remote->icons)) {
            $res->icons = [
                '1x' => isset($remote->icons->{'1x'}) ? $remote->icons->{'1x'} : '',
                '2x' => isset($remote->icons->{'2x'}) ? $remote->icons->{'2x'} : '',
            ];
        }
        
        return $res;
    }
    
    /**
     * After plugin installation
     */
    public function after_install($response, $hook_extra, $result) {
        global $wp_filesystem;
        
        $install_directory = plugin_dir_path(AGENTDESK_PLUGIN_DIR);
        $wp_filesystem->move($result['destination'], $install_directory);
        $result['destination'] = $install_directory;
        
        if ($this->plugin_basename) {
            activate_plugin($this->plugin_basename);
        }
        
        return $result;
    }
    
    /**
     * Request update information from AgentDesk API
     */
    private function request() {
        $remote = get_transient($this->cache_key);
        
        if ($remote === false || !$this->cache_allowed) {
            $api_url = defined('AGENTDESK_API_URL') 
                ? AGENTDESK_API_URL 
                : 'https://agentdesk-backend-production.up.railway.app/api';
            
            $remote = wp_remote_get(
                $api_url . '/wordpress/plugin-update?version=' . $this->version . '&slug=' . $this->plugin_slug,
                [
                    'timeout' => 10,
                    'headers' => [
                        'Accept' => 'application/json',
                    ],
                ]
            );
            
            if (
                is_wp_error($remote) ||
                200 !== wp_remote_retrieve_response_code($remote) ||
                empty(wp_remote_retrieve_body($remote))
            ) {
                return false;
            }
            
            $remote = json_decode(wp_remote_retrieve_body($remote));
            
            if (!$remote || !isset($remote->update_available)) {
                return false;
            }
            
            // Don't cache if no update available
            if ($remote->update_available === false) {
                return false;
            }
            
            set_transient($this->cache_key, $remote, DAY_IN_SECONDS);
        }
        
        return $remote;
    }
    
    /**
     * Clear update cache
     */
    public function clear_cache() {
        delete_transient($this->cache_key);
    }
}

