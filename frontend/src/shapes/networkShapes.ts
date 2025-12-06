import { registerSvgShape } from './svgShapes';
import { ShapeDefinition } from '@/types';

// Network Icons (SVG Paths)
const networkIcons = {
    cloud: `<svg viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#E3F2FD" stroke="#2196F3" stroke-width="2"/></svg>`,
    server: `<svg viewBox="0 0 24 24"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#E8F5E9" stroke="#4CAF50" stroke-width="2"/></svg>`,
    database: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#FFF3E0" stroke="#FF9800" stroke-width="2"/></svg>`,
    router: `<svg viewBox="0 0 24 24"><path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-2.4 2.4l.8-.8C17.8 6.7 17 6.4 16 6.4s-1.8.3-2.6 1.1l.8.8c.4-.4 1-.7 1.8-.7s1.4.3 1.8.7zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z" fill="#F3E5F5" stroke="#9C27B0" stroke-width="2"/></svg>`,
    firewall: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="#FFEBEE" stroke="#F44336" stroke-width="2"/></svg>`,
    pc: `<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#E3F2FD" stroke="#607D8B" stroke-width="2"/></svg>`,
    laptop: `<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#E3F2FD" stroke="#607D8B" stroke-width="2"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" fill="#E0F2F1" stroke="#009688" stroke-width="2"/></svg>`,
};

export function registerNetworkShapes() {
    Object.entries(networkIcons).forEach(([name, svg]) => {
        registerSvgShape(`network-${name}`, svg, { width: 60, height: 60 });
    });
}

export const networkShapeDefinitions: ShapeDefinition[] = [
    {
        name: 'Cloud',
        icon: 'cloud',
        shape: 'network-cloud',
        defaultWidth: 80,
        defaultHeight: 60,
        category: 'network',
    },
    {
        name: 'Server',
        icon: 'server',
        shape: 'network-server',
        defaultWidth: 60,
        defaultHeight: 80,
        category: 'network',
    },
    {
        name: 'Database',
        icon: 'database',
        shape: 'network-database',
        defaultWidth: 60,
        defaultHeight: 80,
        category: 'network',
    },
    {
        name: 'Router',
        icon: 'router', // Will fallback to default in getPreview if not custom handled
        shape: 'network-router',
        defaultWidth: 60,
        defaultHeight: 60,
        category: 'network',
    },
    {
        name: 'Firewall',
        icon: 'shield',
        shape: 'network-firewall',
        defaultWidth: 60,
        defaultHeight: 70,
        category: 'network',
    },
    {
        name: 'PC',
        icon: 'monitor',
        shape: 'network-pc',
        defaultWidth: 60,
        defaultHeight: 50,
        category: 'network',
    },
    {
        name: 'Phone',
        icon: 'smartphone',
        shape: 'network-phone',
        defaultWidth: 40,
        defaultHeight: 70,
        category: 'network',
    },
];
