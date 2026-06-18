'use client';

import { Card, Icon } from '@ui5/webcomponents-react';
import { motion, Variants } from 'framer-motion';
import '@ui5/webcomponents-icons/dist/AllIcons.js'; // Efficiently imports all icons for shorter, dynamic code
import './GradientKpiCard.css';

export type GradientKpiTone = 'blue' | 'red' | 'cyan' | 'purple' | 'green' | 'orange' | 'teal';

export type GradientKpiCardProps = {
  title: string;
  value: string | number;
  note?: string;
  icon: string | React.ReactNode;
  tone?: GradientKpiTone;
  trendIcon?: string | React.ReactNode;
  delay?: number;
  className?: string;
};

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export const GradientKpiGrid = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`gradient-kpi-grid ${className}`.trim()} style={style}>{children}</div>
);

export const GradientKpiCard = ({ title, value, note, icon, tone = 'blue', trendIcon = 'accept', delay = 0, className = '' }: GradientKpiCardProps) => (
  <motion.div variants={variants} initial="hidden" animate="show" transition={{ delay }} whileHover={{ y: -6, scale: 1.02 }} className={`gradient-kpi-motion ${className}`.trim()}>
    <Card className={`gradient-kpi-shell gradient-kpi-shell--${tone}`}>
      <div className="gradient-kpi-card">
        <div className="gradient-kpi-icon">
          {typeof icon === 'string' ? <Icon name={icon} /> : icon}
        </div>
        <div className="gradient-kpi-main">
          <span className="gradient-kpi-label">{title}</span>
          <span className="gradient-kpi-value">{value}</span>
          {note && (
            <span className="gradient-kpi-note">
              {typeof trendIcon === 'string' ? <Icon name={trendIcon} /> : trendIcon}
              {note}
            </span>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);
