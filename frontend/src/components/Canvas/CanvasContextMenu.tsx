import { useEffect, useRef } from 'react';
import type { Cell } from '@antv/x6';
import { Icon } from '../common/Icon';
import { Bot } from 'lucide-react';

interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    cell: Cell | null;
    onClose: () => void;
    onDelete: () => void;
    onCut: () => void;
    onCopy: () => void;
    onDuplicate: () => void;
    onLock: () => void;
    onBringToFront: () => void;
    onSendToBack: () => void;
    onBringForward: () => void;
    onSendBackward: () => void;
    onAIStyleAssist?: () => void;
}

export function CanvasContextMenu({
    visible,
    x,
    y,
    cell,
    onClose,
    onDelete,
    onCut,
    onCopy,
    onDuplicate,
    onLock,
    onBringToFront,
    onSendToBack,
    onBringForward,
    onSendBackward,
    onAIStyleAssist,
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible) return;

        let cleanupFn: (() => void) | null = null;

        const timer = setTimeout(() => {
            const handleClick = (e: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClick);

            cleanupFn = () => {
                document.removeEventListener('mousedown', handleClick);
            };
        }, 100);

        return () => {
            clearTimeout(timer);
            if (cleanupFn) cleanupFn();
        };
    }, [visible, onClose]);

    if (!visible || !cell) return null;

    const isLocked = !!(cell?.getData<any>()?.locked);
    const isNode = cell?.isNode();

    const Divider = () => (
        <div
            style={{
                height: '1px',
                background: 'var(--color-border)',
                margin: '4px 0',
            }}
        />
    );

    const MenuItem = ({ label, icon, onClick, color, customIcon }: { label: string; icon?: string; onClick: () => void; color?: string; customIcon?: React.ReactNode }) => (
        <button
            onClick={() => {
                onClick();
                onClose();
            }}
            style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                color: color || 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {customIcon || (icon && <Icon name={icon} size={14} />)}
            {label}
        </button>
    );

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '4px',
                zIndex: 10000,
                minWidth: '180px',
            }}
        >
            {/* Add to Chat - only for nodes */}
            {isNode && onAIStyleAssist && (
                <>
                    <MenuItem
                        label="Add to Chat"
                        customIcon={<Bot size={14} style={{ color: '#9254DE' }} />}
                        onClick={onAIStyleAssist}
                        color="#9254DE"
                    />
                    <Divider />
                </>
            )}
            <MenuItem label="Delete" icon="trash-2" onClick={onDelete} color="#ef4444" />
            <Divider />
            <MenuItem label="Cut" icon="scissors" onClick={onCut} />
            <MenuItem label="Copy" icon="copy" onClick={onCopy} />
            <MenuItem label="Duplicate" icon="copy-plus" onClick={onDuplicate} />
            <Divider />
            <MenuItem label={isLocked ? 'Unlock' : 'Lock'} icon={isLocked ? 'unlock' : 'lock'} onClick={onLock} />
            <Divider />
            <MenuItem label="Bring to Front" icon="chevrons-up" onClick={onBringToFront} />
            <MenuItem label="Send to Back" icon="chevrons-down" onClick={onSendToBack} />
            <MenuItem label="Bring Forward" icon="chevron-up" onClick={onBringForward} />
            <MenuItem label="Send Backward" icon="chevron-down" onClick={onSendBackward} />
        </div>
    );
}

