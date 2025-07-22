// System health monitoring utilities

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      message?: string;
      lastCheck: Date;
    };
  };
  lastUpdate: Date;
}

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  message?: string;
  responseTime?: number;
}

class SystemHealthMonitor {
  private healthStatus: SystemHealthStatus = {
    overall: 'healthy',
    components: {},
    lastUpdate: new Date()
  };

  private healthChecks: Map<string, () => Promise<HealthCheckResult>> = new Map();
  private checkInterval: number | null = null;

  /**
   * Register a health check for a component
   */
  registerHealthCheck(component: string, checkFn: () => Promise<HealthCheckResult>) {
    this.healthChecks.set(component, checkFn);
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<SystemHealthStatus> {
    const results: HealthCheckResult[] = [];

    for (const [component, checkFn] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          checkFn(),
          new Promise<HealthCheckResult>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        
        result.responseTime = Date.now() - startTime;
        results.push(result);
      } catch (error) {
        results.push({
          component,
          status: 'critical',
          message: `Health check failed: ${error}`,
          responseTime: 5000
        });
      }
    }

    // Update health status
    this.updateHealthStatus(results);
    return this.healthStatus;
  }

  /**
   * Update overall health status based on component results
   */
  private updateHealthStatus(results: HealthCheckResult[]) {
    const components: SystemHealthStatus['components'] = {};
    let criticalCount = 0;
    let warningCount = 0;

    results.forEach(result => {
      components[result.component] = {
        status: result.status,
        message: result.message,
        lastCheck: new Date()
      };

      if (result.status === 'critical') criticalCount++;
      else if (result.status === 'warning') warningCount++;
    });

    // Determine overall status
    let overall: SystemHealthStatus['overall'] = 'healthy';
    if (criticalCount > 0) {
      overall = 'critical';
    } else if (warningCount > 0) {
      overall = 'warning';
    }

    this.healthStatus = {
      overall,
      components,
      lastUpdate: new Date()
    };
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      this.runHealthChecks().catch(console.error);
    }, intervalMs);

    // Run initial check
    this.runHealthChecks().catch(console.error);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): SystemHealthStatus {
    return { ...this.healthStatus };
  }
}

// Default health checks
export const defaultHealthChecks = {
  /**
   * Check if the application is responsive
   */
  applicationResponsive: async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    
    // Simulate app responsiveness check
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      component: 'application',
      status: 'healthy',
      message: 'Application is responsive',
      responseTime: Date.now() - startTime
    };
  },

  /**
   * Check browser compatibility
   */
  browserCompatibility: async (): Promise<HealthCheckResult> => {
    const requiredFeatures = [
      'fetch',
      'Promise',
      'localStorage',
      'sessionStorage'
    ];

    const missingFeatures = requiredFeatures.filter(feature => 
      !(feature in window) && !(feature in globalThis)
    );

    if (missingFeatures.length > 0) {
      return {
        component: 'browser',
        status: 'critical',
        message: `Missing required features: ${missingFeatures.join(', ')}`
      };
    }

    return {
      component: 'browser',
      status: 'healthy',
      message: 'Browser compatibility check passed'
    };
  },

  /**
   * Check memory usage
   */
  memoryUsage: async (): Promise<HealthCheckResult> => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      if (usedPercent > 90) {
        return {
          component: 'memory',
          status: 'critical',
          message: `High memory usage: ${usedPercent.toFixed(1)}%`
        };
      } else if (usedPercent > 70) {
        return {
          component: 'memory',
          status: 'warning',
          message: `Moderate memory usage: ${usedPercent.toFixed(1)}%`
        };
      }

      return {
        component: 'memory',
        status: 'healthy',
        message: `Memory usage: ${usedPercent.toFixed(1)}%`
      };
    }

    return {
      component: 'memory',
      status: 'healthy',
      message: 'Memory monitoring not available'
    };
  },

  /**
   * Check local storage availability
   */
  localStorage: async (): Promise<HealthCheckResult> => {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      return {
        component: 'localStorage',
        status: 'healthy',
        message: 'Local storage is available'
      };
    } catch (error) {
      return {
        component: 'localStorage',
        status: 'warning',
        message: 'Local storage is not available'
      };
    }
  }
};

// Create singleton instance
export const systemHealthMonitor = new SystemHealthMonitor();

// Register default health checks
Object.entries(defaultHealthChecks).forEach(([name, checkFn]) => {
  systemHealthMonitor.registerHealthCheck(name, checkFn);
});

export default systemHealthMonitor;