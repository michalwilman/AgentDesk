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
        
        // Handle "Check for updates" link
        $(document).on('click', '.agentdesk-check-updates', function(e) {
            e.preventDefault();
            
            var $link = $(this);
            var originalText = $link.text();
            
            // Change link to loading state
            $link.html('<span class="spinner is-active" style="float: none; margin: 0;"></span> Checking...');
            $link.css('pointer-events', 'none');
            
            // Make AJAX request
            $.ajax({
                url: agentdeskAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'agentdesk_check_updates',
                    nonce: agentdeskAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        var data = response.data;
                        
                        // Update the status in the row
                        var $row = $link.closest('tr');
                        var $statusSpan = $row.find('.plugin-version-author-uri').find('span').filter(function() {
                            return $(this).text().includes('✓') || $(this).text().includes('Update available');
                        });
                        
                        if (data.update_available) {
                            $statusSpan.html('<span style="color: #d63638; font-weight: 600;">Update available: ' + data.latest_version + '</span>');
                            
                            // Show notice
                            showUpdateNotice(data.message, 'info');
                        } else {
                            $statusSpan.html('<span style="color: #00a32a;">✓ Up to date</span>');
                            
                            // Show success notice
                            showUpdateNotice(data.message, 'success');
                        }
                        
                        // Restore link
                        $link.text(originalText);
                        $link.css('pointer-events', '');
                        
                        // Reload page after 2 seconds if update available
                        if (data.update_available) {
                            setTimeout(function() {
                                location.reload();
                            }, 2000);
                        }
                    } else {
                        showUpdateNotice(response.data.message || 'Failed to check for updates', 'error');
                        $link.text(originalText);
                        $link.css('pointer-events', '');
                    }
                },
                error: function() {
                    showUpdateNotice('Failed to check for updates. Please try again.', 'error');
                    $link.text(originalText);
                    $link.css('pointer-events', '');
                }
            });
        });
        
        // Function to show update notice
        function showUpdateNotice(message, type) {
            var noticeClass = 'notice-' + type;
            var $notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
            
            // Insert after page title
            $('.wp-header-end').after($notice);
            
            // Make notice dismissible
            $notice.find('.notice-dismiss').on('click', function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            });
            
            // Auto-remove after 5 seconds
            setTimeout(function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
        }
    });
    
})(jQuery);

