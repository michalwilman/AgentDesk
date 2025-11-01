/**
 * AgentDesk Admin Scripts
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Token input validation
        $('#agentdesk_api_token').on('input', function() {
            var token = $(this).val();
            var $input = $(this);
            
            // Reset border
            $input.css('border-color', '');
            
            if (token.length > 0) {
                // Check format
                if (!token.match(/^bot_[a-zA-Z0-9_-]{16,}$/)) {
                    $input.css('border-color', '#dc3232');
                } else {
                    $input.css('border-color', '#46b450');
                }
            }
        });
        
        // Display pages conditional logic
        $('#agentdesk_display_pages').on('change', function() {
            var value = $(this).val();
            // Future: Show/hide custom pages input based on selection
        });
        
        // Auto-save notification
        var $form = $('form[action="options.php"]');
        var originalFormData = $form.serialize();
        
        $(window).on('beforeunload', function() {
            if ($form.serialize() !== originalFormData) {
                return 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
        
        // Remove beforeunload when form is submitted
        $form.on('submit', function() {
            $(window).off('beforeunload');
        });
        
        // Add copy button for token input
        if ($('#agentdesk_api_token').length) {
            var $tokenInput = $('#agentdesk_api_token');
            var $copyBtn = $('<button type="button" class="button button-secondary" style="margin-left: 10px;">Copy Token</button>');
            
            $copyBtn.on('click', function() {
                var token = $tokenInput.val();
                if (token) {
                    // Copy to clipboard
                    navigator.clipboard.writeText(token).then(function() {
                        $copyBtn.text('Copied!');
                        setTimeout(function() {
                            $copyBtn.text('Copy Token');
                        }, 2000);
                    });
                }
            });
            
            $tokenInput.after($copyBtn);
        }
        
        // Smooth scroll to errors
        if ($('.settings-error').length) {
            $('html, body').animate({
                scrollTop: $('.settings-error').first().offset().top - 100
            }, 500);
        }
    });
    
})(jQuery);

