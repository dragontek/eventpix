import exifr from 'exifr';

/**
 * Sort photos array by capture timestamp (taken_at or created fallback) descending (newest first)
 */
export function sortPhotosDesc<T extends { taken_at?: string; created?: string }>(photos: T[]): T[] {
    return [...photos].sort((a, b) => {
        const timeA = new Date(a.taken_at || a.created || 0).getTime();
        const timeB = new Date(b.taken_at || b.created || 0).getTime();
        return timeB - timeA;
    });
}

/**
 * Extract photo creation timestamp from image EXIF metadata
 * Supports File, Blob, or Image URL strings (e.g. Appwrite bucket file URL)
 */
export async function getPhotoTakenDate(input: File | Blob | string): Promise<Date | null> {
    try {
        let bufferOrFile: ArrayBuffer | Blob | File = input as any;

        // If input is a URL string, fetch ArrayBuffer first to avoid CORS chunked range issues
        if (typeof input === 'string') {
            const response = await fetch(input);
            if (!response.ok) {
                return null;
            }
            bufferOrFile = await response.arrayBuffer();
        }

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const parsePromise = exifr.parse(bufferOrFile, true);

        const exifData = await Promise.race([parsePromise, timeoutPromise]);

        if (exifData) {
            const takenDate = (exifData as any).DateTimeOriginal || (exifData as any).CreateDate || (exifData as any).ModifyDate;
            if (takenDate instanceof Date && !isNaN(takenDate.getTime())) {
                return takenDate;
            }
            if (typeof takenDate === 'string') {
                const parsed = new Date(takenDate);
                if (!isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
        }
    } catch (err) {
        console.warn("Could not extract EXIF timestamp:", err);
    }

    if (typeof input !== 'string' && (input as File).lastModified && (input as File).lastModified > 0) {
        return new Date((input as File).lastModified);
    }

    return null;
}
