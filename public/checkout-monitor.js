// Checkout Flow Monitor
(function() {
    console.log('CHECKOUT MONITOR ACTIVATED');
    const logs = [];
    function log(type, msg, data) {
        const entry = { time: new Date().toISOString(), type, msg, data };
        logs.push(entry);
        console.log('[MONITOR]', type, msg, data);
    }
    setInterval(() => {
        const container = document.getElementById('card-container');
        if (container) {
            const iframes = container.querySelectorAll('iframe');
            const visible = container.offsetParent !== null;
            if (visible && iframes.length === 0) {
                log('ERROR', 'container visible but NO iframes', {
                    html: container.innerHTML.substring(0, 100),
                    children: container.children.length
                });
            } else if (iframes.length > 0) {
                log('SUCCESS', 'Square iframes: ' + iframes.length);
            }
        }
    }, 1000);
    window.getCheckoutLogs = () => { console.table(logs); return logs; };
    log('INIT', 'Monitor ready');
})();
