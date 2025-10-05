/**
 * 数据采集配置示例
 * 展示如何在应用中配置和使用分数数据采集系统
 */

import { configureScoreCollection, setDataCollectionConsent } from '@/lib/analytics';

// 1. 基础配置示例
export function initializeDataCollection() {
  // 配置数据采集系统
  configureScoreCollection({
    enabled: false, // 默认关闭，需要用户同意后开启
    endpoint: 'https://your-api-endpoint.com/api/collect-scores', // 替换为实际的API端点
    batchSize: 5, // 批量提交大小
    retryAttempts: 3, // 重试次数
    consentRequired: true // 需要用户同意
  });

  console.log('Data collection system initialized');
}

// 2. 开发环境配置
export function initializeDevCollection() {
  configureScoreCollection({
    enabled: true, // 开发环境可以默认开启
    endpoint: 'http://localhost:3001/api/collect-scores', // 本地开发服务器
    batchSize: 1, // 开发环境每条数据都立即提交
    retryAttempts: 1,
    consentRequired: false // 开发环境不需要用户同意
  });

  console.log('Development data collection initialized');
}

// 3. 生产环境配置
export function initializeProductionCollection() {
  configureScoreCollection({
    enabled: false, // 生产环境默认关闭
    endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || '', // 从环境变量读取
    batchSize: 10, // 生产环境批量提交以减少请求
    retryAttempts: 3,
    consentRequired: true // 生产环境必须用户同意
  });

  console.log('Production data collection initialized');
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
