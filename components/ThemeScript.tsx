import Script from "next/script";

// Injected into <head> before any rendering to prevent theme flash.
// Reads localStorage and applies the .dark class synchronously.
// Uses next/script's beforeInteractive strategy (not a plain <script> tag) —
// that's the mechanism Next.js provides specifically for this case, and it
// avoids the "scripts inside React components are never executed" warning.
export function ThemeScript() {
  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
      }}
    />
  );
}
