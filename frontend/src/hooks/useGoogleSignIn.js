import { useEffect, useRef } from 'react';

const useGoogleSignIn = (onCredentialResponse) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        // The script from index.html may not have finished loading yet — retry shortly
        setTimeout(initializeGoogle, 100);
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('Google Sign-In is disabled: VITE_GOOGLE_CLIENT_ID is missing in environment variables.');
        return;
      }

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
    };

    initializeGoogle();
  }, [onCredentialResponse]);

  return buttonRef;
};

export default useGoogleSignIn;