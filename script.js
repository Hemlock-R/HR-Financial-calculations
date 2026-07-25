        // PROPER EVENT LISTENER SETUP FOR IMPORT - ENHANCED
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupImportListener);
        } else {
            setupImportListener();
        }

        function setupImportListener() {
            const importFile = document.getElementById('importFile');
            if (importFile) {
                // Remove any old listeners
                importFile.removeEventListener('change', importSystemData);
                // Add fresh listener
                importFile.addEventListener('change', function(event) {
                    importSystemData(event);
                    // Reset the input so same file can be imported again
                    this.value = '';
                });
            }
        }

        window.onload = function() { 
            applyPreferencesEngineState();
            setupImportListener();
        };
