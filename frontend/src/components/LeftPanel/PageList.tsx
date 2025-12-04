import { useState, useRef, useEffect } from 'react';
import { usePageStore } from '@/store';
import { useEditorStore } from '@/store';
import { exportGraphData } from '@/utils/graphUtils';
import { Button, IconButton } from '../common/Button';
import { Icon } from '../common/Icon';
import styles from './LeftPanel.module.css';

export function PageList() {
  const {
    pages,
    currentPageId,
    addPage,
    deletePage,
    renamePage,
    duplicatePage,
    setCurrentPage,
    updatePageData,
  } = usePageStore();
  
  const { graph } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handlePageClick = (pageId: string) => {
    if (pageId === currentPageId) return;
    
    // Save current page data before switching
    if (graph && currentPageId) {
      const data = exportGraphData(graph);
      updatePageData(currentPageId, data);
    }
    
    setCurrentPage(pageId);
  };

  const handleDoubleClick = (pageId: string, name: string) => {
    setEditingId(pageId);
    setEditName(name);
  };

  const handleRename = () => {
    if (editingId && editName.trim()) {
      renamePage(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  const handleAddPage = () => {
    // Save current page before adding new
    if (graph && currentPageId) {
      const data = exportGraphData(graph);
      updatePageData(currentPageId, data);
    }
    addPage();
  };

  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length > 1) {
      deletePage(pageId);
    }
  };

  const handleDuplicatePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Save current page before duplicating
    if (graph && currentPageId) {
      const data = exportGraphData(graph);
      updatePageData(currentPageId, data);
    }
    duplicatePage(pageId);
  };

  return (
    <div className={styles.pageList}>
      {pages.map((page) => (
        <div
          key={page.id}
          className={`${styles.pageItem} ${page.id === currentPageId ? styles.active : ''}`}
          onClick={() => handlePageClick(page.id)}
          onDoubleClick={() => handleDoubleClick(page.id, page.name)}
        >
          <div className={styles.pageThumbnail}>
            {page.thumbnail && (
              <img src={page.thumbnail} alt={page.name} />
            )}
          </div>
          {editingId === page.id ? (
            <input
              ref={inputRef}
              className={styles.pageNameInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className={styles.pageName}>{page.name}</span>
              <div className={styles.layerActions}>
                <IconButton
                  icon="copy"
                  size="sm"
                  tooltip="Duplicate page"
                  onClick={(e) => handleDuplicatePage(page.id, e)}
                />
                {pages.length > 1 && (
                  <IconButton
                    icon="delete"
                    size="sm"
                    tooltip="Delete page"
                    onClick={(e) => handleDeletePage(page.id, e)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <Button
        icon="plus"
        variant="ghost"
        size="sm"
        className={styles.addPageBtn}
        onClick={handleAddPage}
      >
        Add Page
      </Button>
    </div>
  );
}

export default PageList;