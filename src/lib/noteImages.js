import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

export const MAX_RAW_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_ENCODED_DATA_URL_LENGTH = 720 * 1024;
export const IMAGE_IO_TIMEOUT_MS = 25000;
const PASSTHROUGH_MAX_BYTES = 220 * 1024;
const PASSTHROUGH_MAX_ENCODED = 320 * 1024;

function withTimeout(promise, ms, message) {
    let timerId;
    const timeout = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}

const imageCache = new Map();
const inFlightLoads = new Map();
let cachedWebpSupport = null;

function cacheKey(workspaceId, imageId) {
    return `${workspaceId}:${imageId}`;
}

function supportsWebpEncoding() {
    if (cachedWebpSupport !== null) return cachedWebpSupport;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        cachedWebpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
    } catch {
        cachedWebpSupport = false;
    }
    return cachedWebpSupport;
}

function readBlobAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không đọc được dữ liệu ảnh.'));
        reader.readAsDataURL(blob);
    });
}

function loadImageDimensions(blob) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ img, width: img.naturalWidth || img.width || 0, height: img.naturalHeight || img.height || 0 });
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Không thể giải mã tệp ảnh này.'));
        };
        img.src = objectUrl;
    });
}

function encodeCanvas(img, width, height, mimeType, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL(mimeType, quality);
    // Safari may silently fall back to PNG when WebP encoding is unsupported.
    if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
        return encodeCanvas(img, width, height, 'image/jpeg', quality);
    }
    return { dataUrl, mimeType: dataUrl.startsWith('data:image/webp') ? 'image/webp' : mimeType };
}

export async function compressImageFile(file) {
    if (!file || !String(file.type || '').startsWith('image/')) {
        throw new Error('Chỉ hỗ trợ chèn tệp hình ảnh.');
    }
    if (file.size > MAX_RAW_IMAGE_BYTES) {
        throw new Error('Ảnh gốc quá lớn (tối đa 20 MB).');
    }

    const safeName = String(file.name || 'image').slice(0, 120);
    const { img, width, height } = await loadImageDimensions(file);
    if (!width || !height) {
        throw new Error('Không đọc được kích thước ảnh.');
    }

    // Preserve animated GIFs when they fit comfortably under the document limit.
    if (file.type === 'image/gif' && file.size <= 500 * 1024) {
        const dataUrl = await readBlobAsDataUrl(file);
        if (dataUrl.length <= MAX_ENCODED_DATA_URL_LENGTH) {
            return { dataUrl, mimeType: 'image/gif', width, height, size: dataUrl.length, name: safeName };
        }
    }

    // Preserve small crisp screenshots/images without unnecessary recompression.
    if (
        file.size <= PASSTHROUGH_MAX_BYTES &&
        ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    ) {
        const dataUrl = await readBlobAsDataUrl(file);
        if (dataUrl.length <= PASSTHROUGH_MAX_ENCODED) {
            return { dataUrl, mimeType: file.type, width, height, size: dataUrl.length, name: safeName };
        }
    }

    const preferredMime = supportsWebpEncoding() ? 'image/webp' : 'image/jpeg';
    const attempts = [
        { maxDim: 1600, quality: 0.86 },
        { maxDim: 1600, quality: 0.76 },
        { maxDim: 1280, quality: 0.78 },
        { maxDim: 1280, quality: 0.66 },
        { maxDim: 1024, quality: 0.68 },
        { maxDim: 800, quality: 0.6 },
    ];

    for (const attempt of attempts) {
        const scale = Math.min(1, attempt.maxDim / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));
        const encoded = encodeCanvas(img, targetWidth, targetHeight, preferredMime, attempt.quality);
        if (encoded.dataUrl.length <= MAX_ENCODED_DATA_URL_LENGTH) {
            return {
                dataUrl: encoded.dataUrl,
                mimeType: encoded.mimeType,
                width: targetWidth,
                height: targetHeight,
                size: encoded.dataUrl.length,
                name: safeName,
            };
        }
    }

    throw new Error('Ảnh quá lớn sau khi nén (vượt giới hạn lưu trữ). Hãy chọn ảnh nhỏ hơn.');
}

export function getCachedWorkspaceImage(workspaceId, imageId) {
    if (!workspaceId || !imageId) return null;
    return imageCache.get(cacheKey(workspaceId, imageId)) || null;
}

export async function uploadWorkspaceImage(workspaceId, file, noteId = null, options = {}) {
    if (!workspaceId) {
        throw new Error('Chưa sẵn sàng kết nối Sync Key. Hãy thử lại sau vài giây.');
    }

    const timeoutMs = options.timeoutMs ?? IMAGE_IO_TIMEOUT_MS;
    const processed = await compressImageFile(file);
    const ref = collection(db, 'sync_data', workspaceId, 'images');

    let timedOut = false;
    const writePromise = addDoc(ref, {
        dataUrl: processed.dataUrl,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        size: processed.size,
        name: processed.name,
        noteId: noteId || null,
        createdAt: serverTimestamp(),
    });

    // If a slow write eventually completes after client timeout, remove the orphan document.
    writePromise.then(created => {
        if (timedOut && created?.id) {
            void deleteWorkspaceImage(workspaceId, created.id).catch(() => {});
        }
    }).catch(() => {});

    let created;
    try {
        created = await withTimeout(
            writePromise,
            timeoutMs,
            'Tải ảnh lên quá lâu. Hãy kiểm tra kết nối mạng và thử lại.'
        );
    } catch (err) {
        timedOut = true;
        throw err;
    }

    const payload = {
        dataUrl: processed.dataUrl,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
    };
    imageCache.set(cacheKey(workspaceId, created.id), payload);

    return {
        imageId: created.id,
        width: processed.width,
        height: processed.height,
        alt: processed.name,
        size: processed.size,
    };
}

export async function loadWorkspaceImage(workspaceId, imageId, options = {}) {
    if (!workspaceId || !imageId) return null;
    const key = cacheKey(workspaceId, imageId);
    if (imageCache.has(key)) return imageCache.get(key);
    if (inFlightLoads.has(key)) return inFlightLoads.get(key);

    const timeoutMs = options.timeoutMs ?? IMAGE_IO_TIMEOUT_MS;
    const request = (async () => {
        try {
            const snap = await withTimeout(
                getDoc(doc(db, 'sync_data', workspaceId, 'images', imageId)),
                timeoutMs,
                'Tải ảnh quá lâu.'
            );
            if (!snap.exists()) return null;
            const data = snap.data();
            if (!data?.dataUrl) return null;
            const payload = {
                dataUrl: data.dataUrl,
                mimeType: data.mimeType || 'image/webp',
                width: data.width || null,
                height: data.height || null,
            };
            imageCache.set(key, payload);
            return payload;
        } finally {
            inFlightLoads.delete(key);
        }
    })();

    inFlightLoads.set(key, request);
    return request;
}

export async function deleteWorkspaceImage(workspaceId, imageId) {
    if (!workspaceId || !imageId) return;
    imageCache.delete(cacheKey(workspaceId, imageId));
    await deleteDoc(doc(db, 'sync_data', workspaceId, 'images', imageId));
}

export function extractImageIdsFromHtml(html) {
    if (!html || !String(html).includes('data-image-id')) return [];
    const parsed = new DOMParser().parseFromString(String(html), 'text/html');
    const ids = new Set();
    parsed.querySelectorAll('img[data-image-id]').forEach(node => {
        const id = node.getAttribute('data-image-id')?.trim();
        if (id) ids.add(id);
    });
    return [...ids];
}

export function extractClipboardImageFiles(dataTransfer) {
    if (!dataTransfer) return [];
    const files = [];
    const items = Array.from(dataTransfer.items || []);
    for (const item of items) {
        if (item.kind === 'file' && item.type?.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) files.push(file);
        }
    }
    if (files.length > 0) return files;
    return Array.from(dataTransfer.files || []).filter(file => file.type?.startsWith('image/'));
}
