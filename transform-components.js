#!/usr/bin/env node

/**
 * transformComponents.js
 *
 * This script recursively searches your project directory for files with
 * extensions js, jsx, ts, and tsx, and transforms the following:
 *
 * 1. Replaces all invocations of:
 *      InputComponent, TextComponent, HStackComponent, VStackComponent,
 *      HStack, Text, Stack, VStack, Center, Box and any other invocation of
 *      Native base function components.
 *
 * 2. Changes HStackComponent, VStackComponent, HStack, Stack, VStack, Center,
 *    and Box into a View component from React Native. It also converts inline
 *    style props (or similar props like "px", "bold", etc.) into a className
 *    string that fits nativewind style (e.g. style={{ alignItems: 'center', paddingVertical: 4 }}
 *    becomes className="items-center py-4").
 *
 * 3. Changes TextComponent and Text to the new Text imported from '~/components/ui/text'.
 *
 * 4. Removes the importation of the old components.
 *
 * 5. Adds imports for the new components when needed.
 */

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const recast = require('recast');

// Use the Babel parser for plain JavaScript/JSX…
const babelParser = require('recast/parsers/babel');
// …and the TypeScript parser for TS/TSX.
const tsParser = require('recast/parsers/babel-ts');

// Utility that picks the correct parser based on file extension.
function getParser(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        return tsParser;
    }
    return babelParser;
}

// List of components to replace with View
const COMPONENTS_TO_VIEW = ['HStackComponent', 'VStackComponent', 'HStack', 'Stack', 'VStack', 'Center', 'Box'];

// List of text components to replace with new Text
const TEXT_COMPONENTS = ['TextComponent', 'Text'];

// All components to be removed from old imports
const ALL_OLD_COMPONENTS = ['InputComponent', ...COMPONENTS_TO_VIEW, ...TEXT_COMPONENTS];

// A mapping for style object keys to nativewind class names.
const styleMapping = {
    // Alignment
    alignItems: val => {
        switch (val) {
            case 'center':
                return 'items-center';
            case 'flex-start':
                return 'items-start';
            case 'flex-end':
                return 'items-end';
            case 'stretch':
                return 'items-stretch';
            case 'baseline':
                return 'items-baseline';
            default:
                return '';
        }
    },
    justifyContent: val => {
        switch (val) {
            case 'center':
                return 'justify-center';
            case 'flex-start':
                return 'justify-start';
            case 'flex-end':
                return 'justify-end';
            case 'space-between':
                return 'justify-between';
            case 'space-around':
                return 'justify-around';
            case 'space-evenly':
                return 'justify-evenly';
            default:
                return '';
        }
    },
    // Flex properties
    flexDirection: val => {
        if (val === 'row') return 'flex-row';
        if (val === 'column') return 'flex-col';
        return '';
    },
    flex: val => `flex-${val}`,
    gap: val => `gap-${val}`,

    // Spacing: Padding
    padding: val => `p-${val}`,
    paddingVertical: val => `py-${val}`,
    paddingHorizontal: val => `px-${val}`,
    paddingTop: val => `pt-${val}`,
    paddingBottom: val => `pb-${val}`,
    paddingLeft: val => `pl-${val}`,
    paddingRight: val => `pr-${val}`,

    // Spacing: Margin
    margin: val => `m-${val}`,
    marginVertical: val => `my-${val}`,
    marginHorizontal: val => `mx-${val}`,
    marginTop: val => `mt-${val}`,
    marginBottom: val => `mb-${val}`,
    marginLeft: val => `ml-${val}`,
    marginRight: val => `mr-${val}`,

    // Colors
    // When using dot notation (e.g., "pink.500"), replace the dot with a hyphen.
    color: val => `text-${(val || '').toString().replace('.', '-')}`,
    // Supports both backgroundColor and a shorthand "bg" prop.
    backgroundColor: val => `bg-${(val || '').toString().replace('.', '-')}`,
    bg: val => `bg-${(val || '').toString().replace('.', '-')}`,
    // Border color
    borderColor: val => `border-${(val || '').toString().replace('.', '-')}`,

    // Typography
    fontSize: val => `text-${val}`,
    fontWeight: val => {
        if (val === 'normal' || val === '400') return 'font-normal';
        if (val === 'bold' || val === '700') return 'font-bold';
        if (val === '100') return 'font-thin';
        if (val === '200') return 'font-extralight';
        if (val === '300') return 'font-light';
        if (val === '500') return 'font-medium';
        if (val === '600') return 'font-semibold';
        if (val === '800') return 'font-extrabold';
        if (val === '900') return 'font-black';
        return '';
    },
    textAlign: val => {
        switch (val) {
            case 'left':
                return 'text-left';
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            case 'justify':
                return 'text-justify';
            default:
                return '';
        }
    },
    lineHeight: val => `leading-${val}`,

    // Borders
    borderRadius: val => `rounded-${val}`,
    borderWidth: val => {
        if (val === 0) return 'border-0';
        if (val === 1) return 'border'; // Tailwind default for 1px
        return `border-${val}`;
    },
    borderStyle: val => {
        if (val === 'solid') return 'border-solid';
        if (val === 'dashed') return 'border-dashed';
        if (val === 'dotted') return 'border-dotted';
        return '';
    },

    // Dimensions
    width: val => `w-${val}`,
    height: val => `h-${val}`,

    // Overflow
    overflow: val => {
        if (val === 'hidden') return 'overflow-hidden';
        if (val === 'scroll') return 'overflow-scroll';
        if (val === 'auto') return 'overflow-auto';
        return '';
    },

    // Shadow
    shadow: val => {
        if (val === 'none') return 'shadow-none';
        if (val === 'sm') return 'shadow-sm';
        if (val === 'md') return 'shadow-md';
        if (val === 'lg') return 'shadow-lg';
        if (val === 'xl') return 'shadow-xl';
        return '';
    },

    // Android elevation mapping (customized as needed)
    elevation: val => `elevation-${val}`,
};

// Utility function to convert a JSX style object into a nativewind class string.
function convertStyleObject(node) {
    // node should be an ObjectExpression.
    if (!node || node.type !== 'ObjectExpression') return '';
    let classes = [];
    node.properties.forEach(prop => {
        if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            (prop.value.type === 'StringLiteral' || prop.value.type === 'NumericLiteral')
        ) {
            const key = prop.key.name;
            const value = prop.value.value;
            if (styleMapping[key]) {
                const mappedClass = styleMapping[key](value);
                if (mappedClass) classes.push(mappedClass);
            }
        }
    });
    return classes.join(' ');
}

// Utility function to process JSX attributes and return a computed className string.
function computeClassName(attributes) {
    let classList = [];
    // Look for style prop first.
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.type === 'JSXAttribute' && attr.name.name === 'style') {
            if (attr.value && attr.value.expression && attr.value.expression.type === 'ObjectExpression') {
                const computed = convertStyleObject(attr.value.expression);
                if (computed) classList.push(computed);
            }
            // Remove the style prop from attributes.
            attributes.splice(i, 1);
            i--;
        }
        // Process shorthand props like "px" or boolean "bold"
        else if (attr.type === 'JSXAttribute' && ['px', 'py'].includes(attr.name.name)) {
            if (attr.value && (attr.value.type === 'JSXExpressionContainer' || attr.value.type === 'Literal')) {
                let num = attr.value.expression ? attr.value.expression.value : attr.value.value;
                classList.push(`${attr.name.name}-${num}`);
            }
            attributes.splice(i, 1);
            i--;
        } else if (attr.type === 'JSXAttribute' && attr.name.name === 'bold') {
            // If "bold" exists (likely a boolean prop) then add 'font-bold'
            classList.push('font-bold');
            attributes.splice(i, 1);
            i--;
        }
    }
    return classList.join(' ');
}

// Process a single file.
function processFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    let ast;

    try {
        const parser = getParser(filePath);
        ast = recast.parse(code, { parser });
    } catch (error) {
        console.error(`Error parsing ${filePath}: `, error);
        return;
    }

    let hasViewReplacement = false;
    let hasTextReplacement = false;
    let removeImportSpecifiers = new Set();

    // Process import declarations: remove old component imports.
    recast.types.visit(ast, {
        visitImportDeclaration(pathImport) {
            const importDecl = pathImport.node;
            if (importDecl.specifiers) {
                importDecl.specifiers = importDecl.specifiers.filter(spec => {
                    // For ImportSpecifier (named imports) check the "imported" property.
                    if (spec.type === 'ImportSpecifier' && ALL_OLD_COMPONENTS.includes(spec.imported.name)) {
                        removeImportSpecifiers.add(spec.imported.name);
                        return false;
                    }
                    // If it's a default or namespace import, keep it.
                    return true;
                });
            }
            // If no specifiers remain, remove the entire import.
            if (importDecl.specifiers.length === 0) {
                pathImport.prune();
                return false;
            }
            this.traverse(pathImport);
        },
    });

    // Process JSX elements.
    recast.types.visit(ast, {
        visitJSXElement(pathJSX) {
            const openingEl = pathJSX.node.openingElement;
            if (openingEl.name.type === 'JSXIdentifier') {
                const tagName = openingEl.name.name;
                // For components to be replaced with View.
                if (COMPONENTS_TO_VIEW.includes(tagName)) {
                    openingEl.name.name = 'View';
                    // Also if there is a closing element, change it.
                    if (pathJSX.node.closingElement) {
                        pathJSX.node.closingElement.name.name = 'View';
                    }
                    const computedClass = computeClassName(openingEl.attributes);
                    if (computedClass) {
                        // Add or merge with existing className
                        openingEl.attributes.push(
                            recast.types.builders.jsxAttribute(
                                recast.types.builders.jsxIdentifier('className'),
                                recast.types.builders.stringLiteral(computedClass)
                            )
                        );
                    }
                    hasViewReplacement = true;
                }

                // For components to be replaced with Text.
                else if (TEXT_COMPONENTS.includes(tagName)) {
                    openingEl.name.name = 'Text';
                    if (pathJSX.node.closingElement) {
                        pathJSX.node.closingElement.name.name = 'Text';
                    }
                    const computedClass = computeClassName(openingEl.attributes);
                    if (computedClass) {
                        openingEl.attributes.push(
                            recast.types.builders.jsxAttribute(
                                recast.types.builders.jsxIdentifier('className'),
                                recast.types.builders.stringLiteral(computedClass)
                            )
                        );
                    }
                    hasTextReplacement = true;
                }
            }
            this.traverse(pathJSX);
        },
    });

    // Add new import declarations if necessary.
    const b = recast.types.builders;
    const body = ast.program.body;
    let hasReactNativeImport = false;
    let hasNewTextImport = false;

    body.forEach(node => {
        if (node.type === 'ImportDeclaration' && node.source.value === 'react-native') {
            hasReactNativeImport = true;
            // If View isn’t imported, add it.
            let viewImported = node.specifiers.some(
                spec => spec.type === 'ImportSpecifier' && spec.imported.name === 'View'
            );
            if (!viewImported && hasViewReplacement) {
                node.specifiers.push(b.importSpecifier(b.identifier('View'), b.identifier('View')));
            }
        }
        if (
            node.type === 'ImportDeclaration' &&
            (node.source.value === 'react-native' || node.source.value === 'native-base')
        ) {
            // These have been modified, so we skip.
        }
        if (node.type === 'ImportDeclaration' && node.source.value === '~/components/ui/text') {
            hasNewTextImport = true;
        }
    });

    // If no react-native import exists and we replaced something with View, add it.
    if (!hasReactNativeImport && hasViewReplacement) {
        body.unshift(
            b.importDeclaration(
                [b.importSpecifier(b.identifier('View'), b.identifier('View'))],
                b.literal('react-native')
            )
        );
    }

    // If new Text component import is missing and we replaced any Text component.
    if (!hasNewTextImport && hasTextReplacement) {
        body.unshift(
            b.importDeclaration([b.importDefaultSpecifier(b.identifier('Text'))], b.literal('~/components/ui/text'))
        );
    }

    const output = recast.print(ast).code;
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`Processed ${filePath}`);
}

// Specify your target root directory (you can make this an absolute or relative path)
const targetRoot = 'components'; // e.g., 'src', 'app', etc.

// Fast-glob pattern to match JavaScript/TypeScript files recursively.
const pattern = '**/*.{js,jsx,ts,tsx}';

// Run fast-glob with the current working directory set to targetRoot,
// and ignore the node_modules folder.
(async () => {
    try {
        const files = await fg(pattern, {
            cwd: targetRoot,
            ignore: ['node_modules/**'],
        });
        console.log(files);
        // Prepend the targetRoot to each relative file path if you need full paths.
        files.map(file => path.join(targetRoot, file)).forEach(filePath => processFile(filePath));
    } catch (err) {
        console.error('Error finding files:', err);
    }
})();
