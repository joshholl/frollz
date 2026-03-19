/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      // LHCI's built-in static server serves index.html as SPA fallback for
      // all unmatched paths, so Vue Router history-mode routes work correctly.
      staticDistDir: './frollz-ui/dist',
      url: [
        'http://localhost/',          // Dashboard
        'http://localhost/rolls',     // Roll list
        'http://localhost/stocks',    // Stocks
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Target thresholds for v0.2.0 — will pass once #199-#206 are merged.
        // Until then CI reports failures as expected signal that work remains.
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.8 }],
      },
    },
    upload: process.env.LHCI_SERVER_BASE_URL
      ? {
          target: 'lhci',
          serverBaseUrl: process.env.LHCI_SERVER_BASE_URL,
          token: process.env.LHCI_TOKEN,
        }
      : {
          // No server configured — store results temporarily for inspection in CI logs
          target: 'temporary-public-storage',
        },
  },
}
