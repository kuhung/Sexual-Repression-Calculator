import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-muted bg-white/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-psychology-primary" />
              <span className="font-bold text-psychology-primary text-lg">SRI Calculator</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              基于科学研究的性压抑指数计算器，帮助您更好地了解自己的性心理健康。
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">评估工具</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/assessment?type=quick" className="hover:text-psychology-primary transition-colors">快速测评</Link></li>
              <li><Link to="/assessment?type=full" className="hover:text-psychology-primary transition-colors">完整测评</Link></li>
              <li><Link to="/history" className="hover:text-psychology-primary transition-colors">历史记录</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">资源</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-psychology-primary transition-colors">使用指南</Link></li>
              <li><Link to="/science" className="hover:text-psychology-primary transition-colors">科学依据</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">支持</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-psychology-primary transition-colors">常见问题</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-muted mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4 text-center md:text-left">
          <p>© {currentYear} 性压抑指数计算器. 仅供教育和自我了解使用，不能替代专业心理健康服务。</p>
          <p className="flex items-center justify-center gap-1">
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

