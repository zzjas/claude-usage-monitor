export interface UsageData {
  currentSession: number;
  weeklyAllModels: number;
  weeklyOpus: number;
  timestamp: number;
}

export interface Config {
  email: {
    from: string;
    to: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  schedule: {
    checkInterval: string; // cron format
  };
  notifications: {
    weeklyUsageThreshold: number; // percentage increase to trigger notification
    sessionDropThreshold: number; // session percentage that triggers notification when drops to 0
    weeklyMilestones: number[]; // weekly usage milestones to trigger notifications (e.g., [25, 50, 70, 80, 90, 95, 99])
    sessionMilestones: number[]; // session usage milestones to trigger notifications (e.g., [70, 80, 90, 95])
  };
  storage: {
    dataFile: string;
  };
}

export interface UsageHistory {
  lastWeeklyUsage: number;
  lastSessionUsage: number;
  lastNotificationTimestamp: number;
  history: UsageData[];
}
