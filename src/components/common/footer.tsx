import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-muted bg-white/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-psychology-primary" />
              <span className="font-bold text-psychology-primary">SRI Calculator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              基于科学研究的性压抑指数计算器，帮助您更好地了解自己的性心理健康。
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">评估工具</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/assessment?type=quick" className="hover:text-psychology-primary">快速测评</Link></li>
              <li><Link to="/assessment?type=full" className="hover:text-psychology-primary">完整测评</Link></li>
              <li><Link to="/history" className="hover:text-psychology-primary">历史记录</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">资源</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-psychology-primary">使用指南</Link></li>
              <li><Link to="/science" className="hover:text-psychology-primary">科学依据</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">支持</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-psychology-primary">常见问题</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-muted mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p>© {currentYear} 性压抑指数计算器. 仅供教育和自我了解使用，不能替代专业心理健康服务。</p>
          <p className="flex items-center gap-1">
            Deployed by 
            <a 
              href="https://kuhung.me/about" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-medium hover:text-psychology-primary transition-colors"
            >
              kuhung
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

