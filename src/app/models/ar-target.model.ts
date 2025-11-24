/**
 * AR Target Model
 * Represents a single Augmented Reality target configuration
 */
export interface ARTarget {
    markerType: MarkerType;
    value?: number;
    content: ARContent;
}

/**
 * Marker Type Enumeration
 * Defines the supported marker types for AR detection
 */
export enum MarkerType {
    HIRO = 'hiro',
    KANJI = 'kanji',
    BARCODE = 'barcode'
}

/**
 * AR Content Configuration
 * Defines what visual content is displayed when marker is detected
 */
export interface ARContent {
    type: ContentType;
    src?: string;
    color?: string;
    opacity?: number;
    height?: number;
    radius?: number;
    animation?: string;
    [key: string]: any; // Allow additional dynamic properties
}

/**
 * Content Type Enumeration
 * Defines the supported 3D object types for AR content
 */
export enum ContentType {
    IMAGE = 'image',
    BOX = 'box',
    SPHERE = 'sphere',
    CYLINDER = 'cylinder',
    TORUS = 'torus'
}

/**
 * Image Upload Result
 * Response structure from successful image upload
 */
export interface ImageUploadResult {
    publicUrl: string;
    signedUrl: string;
    path: string;
}
