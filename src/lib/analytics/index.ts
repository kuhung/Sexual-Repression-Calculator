/**
 * 分数数据采集系统 - 用于收集匿名化的评估结果统计
 * 遵循隐私保护原则，只采集必要的统计数据
 */

import { AssessmentSession, Demographics, SRIResult } from '@/types';

// 采集数据的接口定义
export interface ScoreDataPoint {
  // 基础信息
  timestamp: string;
  sessionType: 'quick' | 'full';
  
  // 分数数据
  sriScore: number;
  sriLevel: string;
  
  // 四维度分数
  dimensions: {
    sosReversed: number;
    sexGuilt: number;
    sexualShame: number;
    sisOverSes: number;
  };
  
  // 匿名化的人口学信息
  demographics: {
    ageGroup: string;
    genderCategory: string;
    relationshipCategory: string;
    sexualActivityCategory: string;
  };
  
  // 系统信息
  userAgent?: string;
  screenResolution?: string;
  language?: string;
}

// 数据采集配置
export interface CollectionConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  retryAttempts: number;
  consentRequired: boolean;
}

// 默认配置
const DEFAULT_CONFIG: CollectionConfig = {
  enabled: false, // 默认关闭，需要明确启用
  batchSize: 10,
  retryAttempts: 3,
  consentRequired: true
};

class ScoreDataCollector {
  private config: CollectionConfig;
  private dataQueue: ScoreDataPoint[] = [];
  private isSubmitting = false;

  constructor(config?: Partial<CollectionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 更新采集配置
   */
  updateConfig(config: Partial<CollectionConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 检查是否有用户同意采集数据
   */
  private hasUserConsent(): boolean {
    if (!this.config.consentRequired) return true;
    
    const consent = localStorage.getItem('sri_data_collection_consent');
    return consent === 'true';
  }

  /**
   * 设置用户同意状态
   */
  setUserConsent(consent: boolean) {
    localStorage.setItem('sri_data_collection_consent', consent.toString());
  }

  /**
   * 匿名化人口学信息
   */
  private anonymizeDemographics(demographics: Demographics) {
    return {
      ageGroup: this.categorizeAge(demographics.age),
      genderCategory: this.categorizeGender(demographics.gender),
      relationshipCategory: this.categorizeRelationship(demographics.relationshipStatus),
      sexualActivityCategory: this.categorizeSexualActivity(demographics.sexualActivity)
    };
  }

  private categorizeAge(age: string): string {
    // 将具体年龄转换为年龄段
    const ageMap: Record<string, string> = {
      '0': 'teen', // 14-17
      '1': 'young_adult', // 18-25
      '2': 'adult', // 26-35
      '3': 'middle_adult', // 36-45
      '4': 'mature_adult', // 46-55
      '5': 'senior' // 56+
    };
    return ageMap[age] || 'unknown';
  }

  private categorizeGender(gender: string): string {
    const genderMap: Record<string, string> = {
      'male': 'male',
      'female': 'female',
      'non_binary': 'non_binary',
      'prefer_not_to_say': 'other'
    };
    return genderMap[gender] || 'other';
  }

  private categorizeRelationship(status: string): string {
    const statusMap: Record<string, string> = {
      'single': 'single',
      'dating': 'partnered',
      'committed': 'partnered',
      'married': 'married',
      'divorced': 'single',
      'widowed': 'single',
      'complicated': 'other'
    };
    return statusMap[status] || 'other';
  }

  private categorizeSexualActivity(activity: string): string {
    const activityMap: Record<string, string> = {
      'active': 'active',
      'inactive': 'inactive',
      'no_experience': 'inexperienced',
      'prefer_not_to_say': 'other'
    };
    return activityMap[activity] || 'other';
  }

  /**
   * 获取系统信息
   */
  private getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language
    };
  }

  /**
   * 采集单个评估结果
   */
  async collectScoreData(session: AssessmentSession): Promise<boolean> {
    // 检查是否启用采集
    if (!this.config.enabled) {
      console.log('Score data collection is disabled');
      return false;
    }

    // 检查用户同意
    if (!this.hasUserConsent()) {
      console.log('User has not consented to data collection');
      return false;
    }

    // 检查数据完整性
    if (!session.results || !session.completed) {
      console.log('Session is incomplete, skipping data collection');
      return false;
    }

    try {
      const dataPoint: ScoreDataPoint = {
        timestamp: new Date().toISOString(),
        sessionType: session.type,
        sriScore: Math.round(session.results.sri.totalScore),
        sriLevel: session.results.sri.level,
        dimensions: {
          sosReversed: Number(session.results.sri.dimensionScores.sosReversed.toFixed(2)),
          sexGuilt: Number(session.results.sri.dimensionScores.sexGuilt.toFixed(2)),
          sexualShame: Number(session.results.sri.dimensionScores.sexualShame.toFixed(2)),
          sisOverSes: Number(session.results.sri.dimensionScores.sisOverSes.toFixed(2))
        },
        demographics: this.anonymizeDemographics(session.demographics),
        ...this.getSystemInfo()
      };

      // 添加到队列
      this.dataQueue.push(dataPoint);
      console.log('Score data point added to queue:', dataPoint);

      // 如果队列达到批量大小，提交数据
      if (this.dataQueue.length >= this.config.batchSize) {
        await this.submitQueuedData();
      }

      return true;
    } catch (error) {
      console.error('Error collecting score data:', error);
      return false;
    }
  }

  /**
   * 提交队列中的数据
   */
  async submitQueuedData(): Promise<boolean> {
    if (this.dataQueue.length === 0 || this.isSubmitting) {
      return true;
    }

    if (!this.config.endpoint) {
      console.log('No endpoint configured for data submission');
      return false;
    }

    this.isSubmitting = true;

    try {
      const dataToSubmit = [...this.dataQueue];
      this.dataQueue = []; // 清空队列

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sri_score_data',
          data: dataToSubmit,
          version: '1.0.0'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Successfully submitted ${dataToSubmit.length} data points`);
      return true;

    } catch (error) {
      console.error('Error submitting score data:', error);
      // 重新添加到队列以便重试
      this.dataQueue.unshift(...this.dataQueue);
      return false;
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * 强制提交所有队列数据
   */
  async flush(): Promise<boolean> {
    return await this.submitQueuedData();
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queueSize: this.dataQueue.length,
      isSubmitting: this.isSubmitting,
      config: this.config
    };
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.dataQueue = [];
  }
}

// 创建全局实例
export const scoreDataCollector = new ScoreDataCollector();

/**
 * 便捷函数：采集评估结果数据
 */
export async function collectAssessmentScore(session: AssessmentSession): Promise<boolean> {
  return await scoreDataCollector.collectScoreData(session);
}

/**
 * 便捷函数：配置数据采集
 */
export function configureScoreCollection(config: Partial<CollectionConfig>) {
  scoreDataCollector.updateConfig(config);
}

/**
 * 便捷函数：设置用户同意
 */
export function setDataCollectionConsent(consent: boolean) {
  scoreDataCollector.setUserConsent(consent);
}

/**
 * 便捷函数：检查采集状态
 */
export function getCollectionStatus() {
  return scoreDataCollector.getQueueStatus();
}

/**
 * 便捷函数：导出本地数据（用于调试）
 */
export function exportCollectedData() {
  const status = scoreDataCollector.getQueueStatus();
  const data = {
    timestamp: new Date().toISOString(),
    status,
    consent: localStorage.getItem('sri_data_collection_consent')
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sri_collection_data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
