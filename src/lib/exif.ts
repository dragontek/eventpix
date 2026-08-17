import exifr from 'exifr';

/**
 * Extract photo creation timestamp from image EXIF metadata
 * Fallback to file.lastModified or current timestamp if EXIF is missing
 */
export async function getPhotoTakenDate(file: File): Promise<Date> {
    try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const parsePromise = exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);

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

    // Fallback to file system lastModified date if sensible
    if (file.lastModified && file.lastModified > 0) {
        return new Date(file.lastModified);
    }

    return new Date();
}
