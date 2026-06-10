/**
 * 数据采集配置示例
 * 展示如何在应用中配置和使用分数数据采集系统
 */

import { configureScoreCollection, setDataCollectionConsent } from '@/lib/analytics';

// 1. 基础配置
export function initializeDataCollection() {
  configureScoreCollection({
    enabled: false,
    endpoint: '',
    batchSize: 5,
    retryAttempts: 3,
    consentRequired: true
  });
}

// 2. 开发环境配置
export function initializeDevCollection() {
  configureScoreCollection({
    enabled: false,
    endpoint: 'http://localhost:3001/api/collect-scores',
    batchSize: 1,
    retryAttempts: 1,
    consentRequired: false
  });
}

// 3. 生产环境配置
export function initializeProductionCollection() {
  configureScoreCollection({
    enabled: false,
    endpoint: '',
    batchSize: 10,
    retryAttempts: 3,
    consentRequired: true
  });
}

// 4. 用户同意处理示例
export function handleUserConsent(consent: boolean) {
  setDataCollectionConsent(consent);
  
  if (consent) {
    console.log('User consented to data collection');
    // 可以在这里触发一些初始化逻辑
  } else {
    console.log('User declined data collection');
    // 确保采集系统被禁用
    configureScoreCollection({ enabled: false });
  }
}

// 5. 环境检测和自动配置
export function autoConfigureDataCollection() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    initializeDevCollection();
  } else if (isProduction) {
    initializeProductionCollection();
  } else {
    initializeDataCollection(); // 默认配置
  }
}

// 使用示例：在应用启动时调用
// autoConfigureDataCollection();
