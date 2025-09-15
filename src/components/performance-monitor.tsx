'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { reportWebVitals } from '@/lib/monitoring';

// Web Vitals monitoring component
export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);

    // Monitor custom performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Resource loading performance
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;

          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'resource_load', {
              event_category: 'Performance',
              event_label: resourceEntry.name,
              value: Math.round(resourceEntry.duration),
              custom_map: {
                resource_type: resourceEntry.initiatorType,
                response_time: Math.round(resourceEntry.responseEnd - resourceEntry.requestStart),
                dns_time: Math.round(resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart),
                connect_time: Math.round(resourceEntry.connectEnd - resourceEntry.connectStart),
              }
            });
          }
        }

        // Navigation timing
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;

          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_load', {
              event_category: 'Performance',
              value: Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart),
              custom_map: {
                dom_interactive: Math.round(navigationEntry.domInteractive - navigationEntry.fetchStart),
                dom_complete: Math.round(navigationEntry.domComplete - navigationEntry.fetchStart),
                load_event: Math.round(navigationEntry.loadEventEnd - navigationEntry.loadEventStart),
              }
            });
          }
        }

        // Paint timing
        if (entry.entryType === 'paint') {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', entry.name.replace('-', '_'), {
              event_category: 'Performance',
              value: Math.round(entry.startTime),
            });
          }
        }
      });
    });

    // Observe different types of performance entries
    observer.observe({ entryTypes: ['resource', 'navigation', 'paint'] });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        if (memory && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'memory_usage', {
            event_category: 'Performance',
            custom_map: {
              used_heap: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
              total_heap: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
              heap_limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
            }
          });
        }
      };

      // Check memory usage every 30 seconds
      const memoryInterval = setInterval(checkMemory, 30000);

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}

// Performance timing hook
export function usePerformanceTiming() {
  const startTiming = (name: string) => {
    performance.mark(`${name}-start`);
  };

  const endTiming = (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'custom_timing', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(measure.duration),
      });
    }

    // Clean up marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return measure?.duration || 0;
  };

  const measureAsync = async <T,>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
    startTiming(name);
    try {
      const result = await asyncFn();
      endTiming(name);
      return result;
    } catch (error) {
      endTiming(name);
      throw error;
    }
  };

  return {
    startTiming,
    endTiming,
    measureAsync,
  };
}

// Network quality monitoring
export function NetworkMonitor() {
  useEffect(() => {
    // Monitor network connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const reportNetworkInfo = () => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'network_info', {
            event_category: 'Performance',
            custom_map: {
              effective_type: connection?.effectiveType || 'unknown',
              downlink: connection?.downlink || 0,
              rtt: connection?.rtt || 0,
              save_data: connection?.saveData || false,
            }
          });
        }
      };

      // Report initial network info
      reportNetworkInfo();

      // Listen for network changes
      connection?.addEventListener?.('change', reportNetworkInfo);

      return () => {
        connection?.removeEventListener?.('change', reportNetworkInfo);
      };
    }
  }, []);

  return null;
}

// Device performance monitoring
export function DeviceMonitor() {
  useEffect(() => {
    const reportDeviceInfo = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'device_info', {
          event_category: 'Performance',
          custom_map: {
            hardware_concurrency: navigator.hardwareConcurrency || 'unknown',
            device_memory: (navigator as any).deviceMemory || 'unknown',
            screen_width: screen.width,
            screen_height: screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            pixel_ratio: window.devicePixelRatio,
          }
        });
      }
    };

    // Report device info once
    reportDeviceInfo();

    // Listen for viewport changes
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'viewport_change', {
          event_category: 'UX',
          custom_map: {
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
}

// User interaction monitoring
export function InteractionMonitor() {
  useEffect(() => {
    let interactionCount = 0;
    let sessionStart = Date.now();

    const trackInteraction = (type: string) => {
      interactionCount++;

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'user_interaction', {
          event_category: 'UX',
          event_label: type,
          custom_map: {
            interaction_count: interactionCount,
            session_duration: Date.now() - sessionStart,
          }
        });
      }
    };

    // Track various interactions
    const trackClick = () => trackInteraction('click');
    const trackKeyPress = () => trackInteraction('keypress');
    const trackScroll = () => trackInteraction('scroll');

    document.addEventListener('click', trackClick);
    document.addEventListener('keypress', trackKeyPress);
    document.addEventListener('scroll', trackScroll);

    // Report session summary on page unload
    const reportSessionSummary = () => {
      const sessionDuration = Date.now() - sessionStart;
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'session_summary', {
          event_category: 'UX',
          custom_map: {
            session_duration: sessionDuration,
            interaction_count: interactionCount,
            interactions_per_minute: Math.round((interactionCount / sessionDuration) * 60000),
          }
        });
      }
    };

    window.addEventListener('beforeunload', reportSessionSummary);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('keypress', trackKeyPress);
      document.removeEventListener('scroll', trackScroll);
      window.removeEventListener('beforeunload', reportSessionSummary);
    };
  }, []);

  return null;
}

// Error rate monitoring
export function ErrorRateMonitor() {
  useEffect(() => {
    let errorCount = 0;
    let sessionStart = Date.now();

    const handleError = (event: ErrorEvent) => {
      errorCount++;

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'javascript_error', {
          event_category: 'Error',
          event_label: event.message,
          custom_map: {
            filename: event.filename,
            line_number: event.lineno,
            column_number: event.colno,
            error_count: errorCount,
            session_duration: Date.now() - sessionStart,
          }
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount++;

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'unhandled_promise_rejection', {
          event_category: 'Error',
          event_label: String(event.reason),
          custom_map: {
            error_count: errorCount,
            session_duration: Date.now() - sessionStart,
          }
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

// Combined performance monitoring component
export function ComprehensivePerformanceMonitor() {
  return (
    <>
      <PerformanceMonitor />
      <NetworkMonitor />
      <DeviceMonitor />
      <InteractionMonitor />
      <ErrorRateMonitor />
    </>
  );
}