import { useState } from 'react';
import { PageList } from './PageList';
import { LayerTree } from './LayerTree';
import { ShapeLibrary } from './ShapeLibrary';
import { Tabs } from '../common/Tabs';
import styles from './LeftPanel.module.css';

type TabId = 'pages' | 'layers' | 'shapes';

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('shapes');

  const tabs = [
    { id: 'pages' as const, label: 'Pages' },
    { id: 'layers' as const, label: 'Layers' },
    { id: 'shapes' as const, label: 'Shapes' },
  ];

  return (
    <div className={styles.panel}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />
      <div className={styles.content}>
        {activeTab === 'pages' && <PageList />}
        {activeTab === 'layers' && <LayerTree />}
        {activeTab === 'shapes' && <ShapeLibrary />}
      </div>
    </div>
  );
}

export default LeftPanel;