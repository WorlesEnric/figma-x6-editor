import { Graph } from '@antv/x6';
import { ShapeDefinition } from '@/types';

const commonPorts = {
    groups: {
        top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', fill: '#fff' } } },
        right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', fill: '#fff' } } },
        bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', fill: '#fff' } } },
        left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', fill: '#fff' } } },
    },
    items: [{ group: 'top' }, { group: 'right' }, { group: 'bottom' }, { group: 'left' }],
};

export function registerUmlShapes() {
    // UML Class
    Graph.registerNode(
        'uml-class',
        {
            inherit: 'rect',
            width: 160,
            height: 120,
            attrs: {
                body: {
                    fill: '#fff',
                    stroke: '#9E9E9E',
                    strokeWidth: 2,
                },
                label: {
                    text: 'ClassName\n+ attribute\n+ method()',
                    fill: '#333',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    textWrap: { width: -10, ellipsis: true },
                },
            },
            ports: commonPorts,
        },
        true
    );

    // UML Interface
    Graph.registerNode(
        'uml-interface',
        {
            inherit: 'circle',
            width: 60,
            height: 60,
            attrs: {
                body: {
                    fill: '#fff',
                    stroke: '#9E9E9E',
                    strokeWidth: 2,
                },
                label: {
                    text: 'Interface',
                    fill: '#333',
                    fontSize: 11,
                    refY: 70,
                },
            },
            ports: commonPorts,
        },
        true
    );

    // UML Actor
    // Simple path for Actor
    Graph.registerNode(
        'uml-actor',
        {
            inherit: 'path',
            width: 40,
            height: 70,
            attrs: {
                body: {
                    fill: '#fff',
                    stroke: '#333',
                    strokeWidth: 2,
                    d: 'M 20 10 A 10 10 0 1 1 20 10.01 Z M 20 20 L 20 50 M 5 30 L 35 30 M 5 70 L 20 50 L 35 70',
                },
                label: {
                    text: 'Actor',
                    refY: 80,
                    fontSize: 12,
                },
            },
            ports: commonPorts,
        },
        true
    );

    // UML Use Case
    Graph.registerNode(
        'uml-usecase',
        {
            inherit: 'ellipse',
            width: 120,
            height: 60,
            attrs: {
                body: {
                    fill: '#fff',
                    stroke: '#333',
                    strokeWidth: 2,
                },
                label: {
                    text: 'Use Case',
                    fontSize: 12,
                },
            },
            ports: commonPorts,
        },
        true
    );
}

export const umlShapeDefinitions: ShapeDefinition[] = [
    {
        name: 'Class',
        icon: 'layout',
        shape: 'uml-class',
        defaultWidth: 160,
        defaultHeight: 120,
        category: 'uml',
    },
    {
        name: 'Interface',
        icon: 'circle',
        shape: 'uml-interface',
        defaultWidth: 60,
        defaultHeight: 60,
        category: 'uml',
    },
    {
        name: 'Actor',
        icon: 'user',
        shape: 'uml-actor',
        defaultWidth: 40,
        defaultHeight: 70,
        category: 'uml',
    },
    {
        name: 'Use Case',
        icon: 'circle', // Oval
        shape: 'uml-usecase',
        defaultWidth: 120,
        defaultHeight: 60,
        category: 'uml',
    },
];
