<?php
/**
 * Widget Embedding Handler
 * Manages the frontend widget display
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AgentDesk_Widget {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_footer', [$this, 'render_widget'], 100);
    }
    
    /**
     * Check if widget should be displayed on current page
     */
    private function should_display_widget() {
        // Check if widget is enabled
        if (!get_option('agentdesk_enabled')) {
            return false;
        }
        
        // Check if API token is configured
        if (empty(get_option('agentdesk_api_token'))) {
            return false;
        }
        
        // Check display rules
        $display_pages = get_option('agentdesk_display_pages', 'all');
        
        switch ($display_pages) {
            case 'homepage':
                return is_front_page() || is_home();
                
            case 'posts':
                return is_single();
                
            case 'pages':
                return is_page();
                
            case 'all':
            default:
                return true;
        }
    }
    
    /**
     * Render widget
     */
    public function render_widget() {
        // Check if widget should be displayed
        if (!$this->should_display_widget()) {
            return;
        }
        
        // Get settings
        $api_token = get_option('agentdesk_api_token');
        $position = get_option('agentdesk_position', 'bottom-right');
        
        // Get page metadata
        $page_title = get_the_title();
        $page_url = get_permalink();
        
        // Output widget configuration and script
        ?>
        <!-- AgentDesk AI Chatbot -->
        <script id="agentdesk-config">
        (function() {
            window.agentdeskConfig = {
                botToken: <?php echo json_encode($api_token); ?>,
                apiUrl: <?php echo json_encode(AGENTDESK_API_URL); ?>,
                position: <?php echo json_encode($position); ?>,
                source: 'wordpress',
                metadata: {
                    wpVersion: <?php echo json_encode(get_bloginfo('version')); ?>,
                    pluginVersion: <?php echo json_encode(AGENTDESK_VERSION); ?>,
                    siteUrl: <?php echo json_encode(home_url()); ?>,
                    siteName: <?php echo json_encode(get_bloginfo('name')); ?>,
                    pageTitle: <?php echo json_encode($page_title); ?>,
                    pageUrl: <?php echo json_encode($page_url); ?>,
                    language: <?php echo json_encode(get_bloginfo('language')); ?>
                }
            };
            
            // Load widget script
            var script = document.createElement('script');
            script.src = <?php echo json_encode(AGENTDESK_CDN_URL); ?>;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        })();
        </script>
        <!-- End AgentDesk AI Chatbot -->
        <?php
    }
}

