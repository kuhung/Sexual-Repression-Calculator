# 用户分数数据采集系统

本系统为SRI性压抑指数计算器提供了一套完整的用户分数数据采集解决方案，遵循隐私保护原则和GDPR合规要求。

## 🎯 功能特性

### 核心功能
- **匿名化数据采集**：自动匿名化用户的人口学信息和评估结果
- **用户同意管理**：完整的用户同意收集和管理机制
- **批量数据提交**：支持批量提交以优化网络请求
- **本地队列管理**：本地缓存数据，支持离线场景
- **错误重试机制**：网络失败时自动重试
- **隐私保护**：严格遵循数据最小化原则

### 采集的数据类型
- SRI总分和四维度分数
- 匿名化的人口学信息（年龄段、性别类别等）
- 评估类型和完成时间
- 基础技术信息（浏览器类型、屏幕分辨率等）

## 🚀 快速开始

### 1. 基础配置

在应用启动时配置数据采集系统：

```typescript
import { configureScoreCollection } from '@/lib/analytics';

// 配置数据采集
configureScoreCollection({
  enabled: false, // 默认关闭，需要用户同意
  endpoint: 'https://your-api.com/collect-scores',
  batchSize: 10,
  retryAttempts: 3,
  consentRequired: true
});
```

### 2. 用户同意管理

使用内置的同意组件：

```typescript
import { DataCollectionConsent } from '@/components/common';

function SettingsPage() {
  return (
    <div>
      <DataCollectionConsent 
        onConsentChange={(consent) => {
          console.log('User consent:', consent);
        }}
      />
    </div>
  );
}
```

### 3. 自动数据采集

数据采集已集成到评估完成流程中，无需额外代码：

```typescript
// 在 assessment.tsx 中已自动集成
const handleQuestionnaireComplete = async () => {
  // ... 计算结果
  
  // 自动采集分数数据
  await collectAssessmentScore(completedSession);
  
  // ... 其他逻辑
};
```

## 📊 数据结构

### 采集的数据点格式

```typescript
interface ScoreDataPoint {
  timestamp: string;
  sessionType: 'quick' | 'full';
  sriScore: number;
  sriLevel: string;
  dimensions: {
    sosReversed: number;
    sexGuilt: number;
    sexualShame: number;
    sisOverSes: number;
  };
  demographics: {
    ageGroup: string; // 'teen', 'young_adult', 'adult', etc.
    genderCategory: string; // 'male', 'female', 'non_binary', 'other'
    relationshipCategory: string; // 'single', 'partnered', 'married', 'other'
    sexualActivityCategory: string; // 'active', 'inactive', 'inexperienced', 'other'
  };
  userAgent?: string;
  screenResolution?: string;
  language?: string;
}
```

### 服务器端接收格式

```typescript
{
  type: 'sri_score_data',
  data: ScoreDataPoint[],
  version: '1.0.0'
}
```

## 🔧 API 参考

### 配置函数

#### `configureScoreCollection(config)`
配置数据采集系统
- `enabled`: 是否启用采集
- `endpoint`: 数据提交的API端点
- `batchSize`: 批量提交大小
- `retryAttempts`: 重试次数
- `consentRequired`: 是否需要用户同意

#### `setDataCollectionConsent(consent)`
设置用户同意状态
- `consent`: boolean - 用户是否同意数据采集

#### `collectAssessmentScore(session)`
采集单个评估结果
- `session`: AssessmentSession - 完整的评估会话数据

### 状态查询

#### `getCollectionStatus()`
获取当前采集状态
```typescript
{
  queueSize: number,
  isSubmitting: boolean,
  config: CollectionConfig
}
```

## 🛡️ 隐私保护

### 数据匿名化
- 年龄转换为年龄段（如：18-25 → 'young_adult'）
- 具体地理位置信息不采集
- 所有个人标识符被移除
- 评估内容不包含具体题目回答

### 用户控制
- 用户可随时撤回同意
- 支持本地数据导出
- 支持完全删除本地数据
- 透明的数据使用说明

### 合规性
- 遵循GDPR要求
- 实施数据最小化原则
- 提供完整的隐私声明
- 支持用户权利行使

## 🎨 UI组件

### DataCollectionConsent
完整的数据采集同意管理组件
```typescript
<DataCollectionConsent 
  onConsentChange={(consent) => handleConsent(consent)}
  className="custom-class"
/>
```

### DataCollectionConsentCompact
简化版的同意组件，适合嵌入其他页面
```typescript
<DataCollectionConsentCompact 
  onConsentChange={(consent) => handleConsent(consent)}
/>
```

## 🔍 调试和监控

### 开发模式功能
- 详细的控制台日志
- 数据导出功能
- 实时状态监控
- 技术信息显示

### 生产监控
```typescript
// 检查采集状态
const status = getCollectionStatus();
console.log('Queue size:', status.queueSize);
console.log('Is submitting:', status.isSubmitting);
```

## 📝 服务器端实现示例

### Express.js 接收端点
```javascript
app.post('/api/collect-scores', (req, res) => {
  const { type, data, version } = req.body;
  
  if (type !== 'sri_score_data') {
    return res.status(400).json({ error: 'Invalid data type' });
  }
  
  // 验证数据格式
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Data must be an array' });
  }
  
  // 处理数据（存储到数据库等）
  data.forEach(dataPoint => {
    // 进一步验证和处理每个数据点
    console.log('Received score data:', dataPoint);
    // 存储到数据库...
  });
  
  res.json({ success: true, received: data.length });
});
```

## 🚨 注意事项

### 重要提醒
1. **默认禁用**：系统默认禁用数据采集，需要用户明确同意
2. **网络依赖**：需要配置有效的API端点才能提交数据
3. **存储限制**：本地队列有大小限制，避免内存溢出
4. **错误处理**：数据采集失败不应影响用户的正常评估流程

### 最佳实践
- 在用户完成评估后再请求数据采集同意
- 提供清晰的数据使用说明
- 定期清理本地队列数据
- 监控服务器端的数据接收状态

## 📈 未来扩展

### 计划功能
- 实时数据分析面板
- A/B测试支持
- 更细粒度的用户偏好控制
- 数据质量监控和验证

### 集成建议
- 与现有的分析系统集成
- 支持多种数据格式导出
- 添加数据可视化功能
- 实现用户行为分析

---

## 📞 技术支持

如有问题或建议，请联系：
- 邮箱：hi@kuhung.me
- 项目维护者：kuhung

本系统遵循开源最佳实践，欢迎贡献代码和反馈。
