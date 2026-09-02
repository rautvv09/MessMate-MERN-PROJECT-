import { useEffect, useRef } from 'react';

const useGoogleSignIn = (onCredentialResponse) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    let retries = 0;
    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        if (retries < 30) {
          retries++;
          setTimeout(initializeGoogle, 100);
        } else {
          console.error('[Google Sign-In Error] Google Identity Services SDK script failed to load.');
        }
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('[Google Sign-In Warning] VITE_GOOGLE_CLIENT_ID is missing in environment variables.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
          });
        }
      } catch (err) {
        console.error('[Google Sign-In Error] Failed to initialize Google button:', err);
      }
    };

    initializeGoogle();
  }, [onCredentialResponse]);

  return buttonRef;
};

export default useGoogleSignIn;