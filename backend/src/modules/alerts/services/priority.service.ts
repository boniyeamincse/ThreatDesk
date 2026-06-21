import { Injectable } from '@nestjs/common';

interface PriorityScoringInput {
  severity: string;
  criticality?: string;
  hasIOC?: boolean;
  relatedAlerts?: number;
  isOverSLA?: boolean;
}

@Injectable()
export class PriorityService {
  calculatePriority(input: PriorityScoringInput): number {
    let score = 0;

    // Severity scoring (base)
    const severityScore = this.getSeverityScore(input.severity);
    score += severityScore;

    // Asset criticality bonus
    if (input.criticality === 'critical') {
      score += 40;
    } else if (input.criticality === 'high') {
      score += 25;
    } else if (input.criticality === 'medium') {
      score += 10;
    }

    // Known malicious IOC bonus
    if (input.hasIOC) {
      score += 35;
    }

    // Correlation bonus
    if (input.relatedAlerts && input.relatedAlerts > 1) {
      score += Math.min(input.relatedAlerts * 5, 25);
    }

    // SLA breach bonus
    if (input.isOverSLA) {
      score += 30;
    }

    return Math.min(score, 255); // Cap at 255
  }

  private getSeverityScore(severity: string): number {
    const severityMap: Record<string, number> = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };
    return severityMap[severity.toLowerCase()] || 0;
  }

  getSeverityLevel(score: number): string {
    if (score >= 100) return 'critical';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  getSortOrder(alerts: any[]): any[] {
    return alerts.sort((a, b) => {
      // First by priority score (descending)
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      // Then by alert time (oldest first)
      return new Date(a.alertTime).getTime() - new Date(b.alertTime).getTime();
    });
  }
}
