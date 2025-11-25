import { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    let isInitialized = false;

    // Add Google Translate script
    const addScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="translate.google.com"]')) {
        console.log('Google Translate script already exists');
        return;
      }

      console.log('Creating Google Translate script element...');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Add error handling
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
      };
      
      script.onload = () => {
        console.log('Google Translate script loaded, waiting for callback...');
      };
      
      document.head.appendChild(script);
      console.log('Google Translate script added to head');
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (isInitialized) {
        console.log('Google Translate already initialized');
        return;
      }
      
      console.log('Google Translate initialization callback called');
      console.log('window.google:', window.google);
      console.log('window.google.translate:', window.google?.translate);
      
      try {
        if (window.google && window.google.translate) {
          console.log('Initializing Google Translate widget...');
          isInitialized = true;
          
          // Get saved translation preference or default to English (no translation)
          const savedLang = localStorage.getItem('google_translate_lang') || 'en';
          
          // Make sure the element exists
          const translateElement = document.getElementById('google_translate_element');
          if (!translateElement) {
            console.error('Google Translate element not found!');
            return;
          }
          
          console.log('Creating TranslateElement with config:', {
            pageLanguage: 'en',
            includedLanguages: 'ms,en',
            savedLang
          });
          
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en', // Base page is in English (from i18n)
              includedLanguages: 'ms,en', // Only Malay and English
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false, // Don't auto-display the dropdown
              multilanguagePage: true
            },
            'google_translate_element'
          );
          
          console.log('TranslateElement created, waiting for select element...');
          
          // Start hiding UI immediately and continuously
          hideUI();
          monitorAndHide();
          
          // Function to aggressively hide all Google Translate UI elements
          const hideUI = () => {
            try {
              // Hide the default Google Translate element
              const translateElement = document.getElementById('google_translate_element');
              if (translateElement) {
                translateElement.style.cssText = 'position: absolute !important; left: -9999px !important; width: 200px !important; height: 40px !important; visibility: visible !important; opacity: 0 !important; pointer-events: none !important;';
              }
              
              // Hide Google Translate banner (multiple selectors)
              const banners = [
                document.querySelector('.goog-te-banner-frame'),
                document.querySelector('.skiptranslate'),
                document.querySelector('.goog-te-banner-frame.skiptranslate'),
                document.querySelector('iframe[src*="translate.google.com"]')
              ];
              
              // Hide Google Translate loading icons/spinners
              const loadingElements = [
                document.querySelector('.goog-te-spinner'),
                document.querySelector('.goog-te-spinner-pos'),
                document.querySelector('.goog-te-banner-loading'),
                ...document.querySelectorAll('[class*="goog-te-spinner"]'),
                ...document.querySelectorAll('[class*="loading"]'),
                document.querySelector('iframe[src*="translate.google.com"][src*="loading"]')
              ];
              
              banners.forEach(banner => {
                if (banner) {
                  // Hide using opacity and pointer-events instead of display: none
                  // This keeps elements in DOM and accessible to Google Translate scripts
                  banner.style.cssText = 'opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important;';
                  // Don't use display: none - it can cause issues with Google Translate scripts
                }
              });
              
              // Hide loading icons/spinners
              loadingElements.forEach(loadingEl => {
                if (loadingEl) {
                  loadingEl.style.cssText = 'opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; display: none !important;';
                }
              });
              
              // Hide Google Translate footer
              const footer = document.querySelector('.goog-te-footer');
              if (footer) {
                footer.style.cssText = 'opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important;';
              }
              
              // Remove top padding/margin that Google Translate adds
              if (document.body) {
                document.body.style.cssText = 'top: 0 !important; padding-top: 0 !important; margin-top: 0 !important;';
              }
              
              if (document.documentElement) {
                document.documentElement.style.cssText = 'margin-top: 0 !important; padding-top: 0 !important;';
              }
              
              // Hide any other Google Translate UI elements
              const gadgets = document.querySelectorAll('.goog-te-gadget, .goog-te-menu-frame, .goog-te-menu-value, .goog-te-menu2');
              gadgets.forEach(gadget => {
                if (gadget) {
                  gadget.style.cssText = 'opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
                }
              });
              
              console.log('Google Translate UI completely hidden');
            } catch (error) {
              console.warn('Error hiding Google Translate UI:', error);
            }
          };
          
          // Continuously monitor and hide any Google Translate UI that appears
          const monitorAndHide = () => {
            const observer = new MutationObserver(() => {
              hideUI();
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            // Also check periodically
            const hideInterval = setInterval(() => {
              hideUI();
            }, 500);
            
            // Clean up after 10 seconds (should be enough for initialization)
            setTimeout(() => {
              observer.disconnect();
              clearInterval(hideInterval);
            }, 10000);
          };

          // Function to check if Google Translate is ready and dispatch event
          const checkReady = () => {
            const translateElement = document.getElementById('google_translate_element');
            const hasContent = translateElement && translateElement.innerHTML.trim().length > 0;
            
            // Google Translate now uses a custom dropdown (anchor element) instead of select
            const languageLink = translateElement?.querySelector('a[aria-haspopup="true"]') ||
                                 translateElement?.querySelector('.VIpgJd-ZVi9od-xl07Ob-lTBxed') ||
                                 translateElement?.querySelector('a[class*="VIpgJd"]');
            
            // Also check for old-style select (for backward compatibility)
            const select = document.querySelector('.goog-te-combo') || 
                           translateElement?.querySelector('select');
            
            const isReady = hasContent && (languageLink || select);
            
            console.log('Checking for Google Translate element (attempt):', {
              hasContent,
              languageLink: !!languageLink,
              select: !!select,
              isReady
            });
            
            if (isReady) {
              console.log('✅ Google Translate is ready!', {
                hasLanguageLink: !!languageLink,
                hasSelect: !!select
              });
              
              // Hide UI immediately and continuously
              hideUI();
              monitorAndHide();
              
              // Dispatch ready event
              window.dispatchEvent(new CustomEvent('googleTranslateReady'));
              
              // Set initial language if saved (and not English) - but only if cookie doesn't match
              if (savedLang !== 'en') {
                const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
                const expectedCookie = `/en/${savedLang}`;
                
                // Only trigger if cookie doesn't match saved language
                if (!currentCookie || !currentCookie.includes(expectedCookie)) {
                  setTimeout(() => {
                    if (window.triggerGoogleTranslate) {
                      window.triggerGoogleTranslate(savedLang);
                    }
                  }, 1000);
                }
              }
              
              return true;
            }
            
            return false;
          };

          // Start hiding UI immediately (before checking readiness)
          setTimeout(() => {
            hideUI();
            monitorAndHide();
          }, 100);
          
          // Try multiple times to ensure Google Translate is ready
          let attempts = 0;
          const maxAttempts = 30; // Increased attempts
          const checkInterval = setInterval(() => {
            attempts++;
            console.log(`Checking Google Translate readiness (attempt ${attempts}/${maxAttempts})...`);
            
            // Also hide UI on each check to catch any banner that appears
            hideUI();
            
            if (checkReady() || attempts >= maxAttempts) {
              clearInterval(checkInterval);
              if (attempts >= maxAttempts) {
                console.error('Google Translate initialization timeout after', maxAttempts, 'attempts');
                console.log('Page HTML around translate element:', document.getElementById('google_translate_element')?.outerHTML);
              }
            }
          }, 300); // Check every 300ms
        }
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
        isInitialized = false;
      }
    };

    // Function to wait for Google Translate element to be ready
    const waitForGoogleTranslateElement = (callback, maxAttempts = 30, attempt = 0) => {
      if (attempt >= maxAttempts) {
        console.warn('Google Translate element not found after', maxAttempts, 'attempts');
        return false;
      }
      
      const translateElement = document.getElementById('google_translate_element');
      
      // Try to find the language link (new Google Translate UI)
      const languageLink = translateElement?.querySelector('a[aria-haspopup="true"]') ||
                           translateElement?.querySelector('.VIpgJd-ZVi9od-xl07Ob-lTBxed') ||
                           translateElement?.querySelector('a[class*="VIpgJd"]');
      
      // Also try old-style select (for backward compatibility)
      const select = document.querySelector('.goog-te-combo') || 
                     translateElement?.querySelector('select');
      
      if (languageLink || select) {
        callback({ languageLink, select, translateElement });
        return true;
      }
      
      // Try again after a short delay
      setTimeout(() => waitForGoogleTranslateElement(callback, maxAttempts, attempt + 1), 200);
      return false;
    };

    // Function to trigger translation programmatically
    window.triggerGoogleTranslate = (langCode) => {
      // Check if we're already in the desired language state to prevent loops
      const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
      const currentLang = localStorage.getItem('google_translate_lang');
      
      // If already in the desired state, don't do anything
      if (langCode === 'en' && !currentCookie) {
        console.log('Already in English, no action needed');
        return true;
      }
      if (langCode === 'ms' && currentCookie?.includes('/en/ms') && currentLang === 'ms') {
        console.log('Already in Malay, no action needed');
        return true;
      }
      
      // Save language preference
      localStorage.setItem('google_translate_lang', langCode);
      console.log('Triggering Google Translate for language:', langCode);
      
      // Use cookie-based approach and trigger translation
      try {
        const cookieName = 'googtrans';
        
        if (langCode === 'en') {
          // For English, remove cookie to show original
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          console.log('Removed Google Translate cookie');
          
          // Check if page is currently translated
          const isCurrentlyTranslated = document.documentElement.classList.contains('translated-ltr') ||
                                       document.documentElement.classList.contains('translated-rtl') ||
                                       document.body.classList.contains('translated-ltr') ||
                                       document.body.classList.contains('translated-rtl');
          
          // If page is translated, we need to reload to show original
          if (isCurrentlyTranslated) {
            console.log('Page is translated, reloading to show original English...');
            if (!sessionStorage.getItem('google_translate_reloading')) {
              sessionStorage.setItem('google_translate_reloading', 'true');
              window.location.reload();
              return true;
            }
          } else {
            // Page is already in English, no action needed
            console.log('Page is already in English');
            window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
            return true;
          }
        } else {
          // For other languages, set the translation cookie
          const cookieValue = `/en/${langCode}`;
          document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=31536000; SameSite=Lax`;
          console.log('Set Google Translate cookie:', cookieName, '=', cookieValue);
          
          // Try to trigger translation using multiple methods
          // First, try to use Google Translate's internal mechanism
          const tryDirectTranslation = () => {
            // Try accessing Google Translate's internal translation function
            if (window.google && window.google.translate) {
              try {
                // Method: Access the translate element's internal functions
                const translateElement = document.getElementById('google_translate_element');
                if (translateElement && translateElement.__googleTranslateElement) {
                  const element = translateElement.__googleTranslateElement;
                  if (element && element.selectLanguage) {
                    element.selectLanguage(langCode);
                    console.log('Translation triggered via selectLanguage method');
                    window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
                    return true;
                  }
                }
              } catch (e) {
                console.log('Direct translation method not available');
              }
            }
            return false;
          };
          
          // Try direct method first
          if (tryDirectTranslation()) {
            return true;
          }
          
          // Remove hash immediately when starting translation
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          
          // Fallback to widget methods
          return waitForGoogleTranslateElement(({ languageLink, select, translateElement }) => {
            try {
              // Remove hash again when widget is ready
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
              
              let translationTriggered = false;
              
              // Method 1: Try using Google Translate API directly
              if (window.google && window.google.translate && window.google.translate.TranslateService) {
                try {
                  const service = new window.google.translate.TranslateService();
                  service.translatePage('en', langCode);
                  translationTriggered = true;
                  console.log('Translation triggered via TranslateService');
                } catch (e) {
                  console.log('TranslateService.translatePage() not available, trying widget method');
                }
              }
              
              // Method 2: Try using select element (old style)
              if (!translationTriggered && select) {
                try {
                  if (select.value !== langCode) {
                    select.value = langCode;
                    // Trigger multiple events to ensure it works
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                    select.dispatchEvent(new MouseEvent('change', { bubbles: true }));
                    translationTriggered = true;
                    console.log('Google Translate language changed via select to:', langCode);
                  }
                } catch (e) {
                  console.warn('Error using select element:', e);
                }
              }
              
              // Method 3: Try using language link (new style)
              if (!translationTriggered && languageLink) {
                try {
                  // Remove hash before clicking
                  if (window.location.hash) {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                  }
                  
                  // Click the language selector to open dropdown
                  languageLink.click();
                  
                  // Remove hash immediately after click
                  setTimeout(() => {
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                  }, 10);
                  
                  // Wait for dropdown and find the language option
                  setTimeout(() => {
                    // Remove hash again
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                    // Try multiple selectors for language options
                    const langOptions = Array.from(document.querySelectorAll(
                      'a[role="option"], div[role="option"], span[role="option"], ' +
                      'a.goog-te-menu-value, div.goog-te-menu-value, ' +
                      'a[data-value], div[data-value], ' +
                      'a, div, span'
                    ))
                      .filter(el => {
                        const text = (el.textContent || '').toLowerCase();
                        const dataValue = el.getAttribute('data-value') || el.getAttribute('data-lang') || '';
                        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                        
                        if (langCode === 'ms') {
                          return text.includes('malay') || text.includes('melayu') || 
                                 text.includes('bahasa melayu') ||
                                 dataValue === 'ms' ||
                                 ariaLabel.includes('malay') || ariaLabel.includes('melayu');
                        }
                        return false;
                      })
                      .filter(el => el.offsetParent !== null); // Only visible elements
                    
                    if (langOptions.length > 0) {
                      // Remove hash before clicking
                      if (window.location.hash) {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                      }
                      
                      langOptions[0].click();
                      translationTriggered = true;
                      console.log('Google Translate language changed via dropdown to:', langCode);
                      
                      // Remove hash after clicking
                      setTimeout(() => {
                        if (window.location.hash) {
                          window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                      }, 10);
                    } else {
                      console.warn('Language option not found in dropdown');
                    }
                  }, 600);
                } catch (e) {
                  console.warn('Error using language link:', e);
                }
              }
              
              // Method 4: Force Google Translate to re-read cookie and translate
              // This method manually triggers translation by accessing Google Translate's internal state
              if (!translationTriggered) {
                setTimeout(() => {
                  try {
                    // Try to access Google Translate's internal translation function
                    // Google Translate stores translation state in window.google.translate
                    if (window.google && window.google.translate) {
                      // Force a translation by dispatching a custom event that Google Translate listens to
                      const event = new CustomEvent('goog-translate-change', { 
                        detail: { lang: langCode } 
                      });
                      window.dispatchEvent(event);
                      
                      // Also try to manually trigger translation by accessing the iframe
                      const iframe = document.querySelector('iframe[src*="translate.google.com"]');
                      if (iframe && iframe.contentWindow) {
                        try {
                          // Access the iframe's translate function
                          iframe.contentWindow.postMessage({ 
                            type: 'translate', 
                            lang: langCode 
                          }, '*');
                        } catch (e) {
                          console.log('Cannot access iframe (CORS)');
                        }
                      }
                    }
                    
                    // Check if translation was applied after 1.5 seconds
                    setTimeout(() => {
                      const hasTranslation = document.documentElement.classList.contains('translated-ltr') ||
                                            document.documentElement.classList.contains('translated-rtl') ||
                                            document.body.classList.contains('translated-ltr') ||
                                            document.body.classList.contains('translated-rtl');
                      
                      if (!hasTranslation) {
                        // Translation didn't happen, reload page (cookie is already set)
                        console.log('Translation not applied automatically, reloading page to apply translation...');
                        if (!sessionStorage.getItem('google_translate_reloading')) {
                          sessionStorage.setItem('google_translate_reloading', 'true');
                          window.location.reload();
                        }
                      } else {
                        // Translation applied
                        window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
                      }
                    }, 1500);
                  } catch (error) {
                    console.error('Error in Method 4:', error);
                    // Fallback to reload
                    if (!sessionStorage.getItem('google_translate_reloading')) {
                      sessionStorage.setItem('google_translate_reloading', 'true');
                      window.location.reload();
                    }
                  }
                }, 300);
              } else {
                // Translation was triggered, dispatch event after a delay
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
                }, 500);
              }
              
              // Dispatch event immediately for optimistic UI update
              window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
            } catch (error) {
              console.error('Error triggering translation:', error);
              // Fallback to reload
              if (!sessionStorage.getItem('google_translate_reloading')) {
                sessionStorage.setItem('google_translate_reloading', 'true');
                window.location.reload();
              }
            }
          });
        }
        
        // Dispatch event immediately for English
        if (langCode === 'en') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('googleTranslateChanged', { detail: { lang: langCode } }));
          }, 300);
        }
        
        return true;
      } catch (error) {
        console.error('Error setting Google Translate cookie:', error);
        return false;
      }
    };

    // Initialize
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      console.log('Adding Google Translate script...');
      addScript();
      
      // Also check if script loads successfully
      const checkScriptLoad = setInterval(() => {
        if (window.google && window.google.translate) {
          console.log('Google Translate script loaded successfully');
          clearInterval(checkScriptLoad);
          if (!isInitialized) {
            setTimeout(() => {
              window.googleTranslateElementInit();
            }, 100);
          }
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScriptLoad);
        if (!window.google || !window.google.translate) {
          console.error('Google Translate script failed to load after 10 seconds');
        }
      }, 10000);
    } else if (window.google && window.google.translate && !isInitialized) {
      // If script already loaded, initialize immediately
      console.log('Google Translate script already loaded, initializing...');
      setTimeout(() => {
        window.googleTranslateElementInit();
      }, 100);
    } else {
      console.log('Waiting for Google Translate script...', {
        hasGoogle: !!window.google,
        hasTranslate: !!(window.google && window.google.translate),
        isInitialized
      });
    }

    // Clear reload flag on component mount
    sessionStorage.removeItem('google_translate_reloading');
    
    // Prevent hash from being added to URL by Google Translate - AGGRESSIVE APPROACH
    const removeHash = () => {
      if (window.location.hash && window.location.hash !== '') {
        try {
          const url = window.location.pathname + window.location.search;
          // Use replaceState to avoid adding to history
          window.history.replaceState(null, '', url);
        } catch (e) {
          // Ignore errors
        }
      }
    };
    
    const handleHashChange = (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      removeHash();
    };
    
    // Listen for hash changes with capture phase
    window.addEventListener('hashchange', handleHashChange, true);
    window.addEventListener('popstate', handleHashChange, true);
    
    // Override pushState and replaceState to prevent hash
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      if (args[2]) {
        const url = args[2].toString();
        if (url.includes('#')) {
          // Remove hash from URL before pushState
          args[2] = url.split('#')[0];
        }
      }
      const result = originalPushState.apply(window.history, args);
      // Remove hash after pushState (in case it was added)
      setTimeout(removeHash, 0);
      return result;
    };
    
    window.history.replaceState = function(...args) {
      if (args[2]) {
        const url = args[2].toString();
        if (url.includes('#')) {
          args[2] = url.split('#')[0];
        }
      }
      const result = originalReplaceState.apply(window.history, args);
      // Remove hash after replaceState
      setTimeout(removeHash, 0);
      return result;
    };
    
    // Intercept hash changes using a different approach
    // We can't override location.hash directly, so we'll use a more aggressive polling approach
    // Also check periodically for hash (very frequent)
    const hashCheckInterval = setInterval(() => {
      removeHash();
    }, 10); // Check every 10ms - very aggressive
    
    // Also intercept any attempts to change hash via direct assignment
    // This is done by wrapping the location object (but we can't redefine hash, so we monitor it)
    const originalLocation = window.location;
    
    // Create a proxy to intercept hash changes (if possible)
    try {
      // Try to intercept via MutationObserver on the URL
      const urlObserver = new MutationObserver(() => {
        removeHash();
      });
      
      // Monitor document for any changes that might affect URL
      urlObserver.observe(document, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } catch (e) {
      // MutationObserver might not work for URL changes, that's okay
      console.log('Could not set up URL observer');
    }
    
    return () => {
      // Cleanup function - don't remove the element, just mark as not initialized
      isInitialized = false;
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(hashCheckInterval);
    };
  }, []);

  return (
    <div 
      id="google_translate_element"
      style={{ 
        position: 'absolute', 
        left: '-9999px', 
        width: '200px', 
        height: '40px',
        visibility: 'visible', // Keep visible for initialization
        opacity: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default GoogleTranslate;

