import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Image, Center, Loader, Title } from '@mantine/core';
import { useData } from '../providers/DataProvider';
import type { Photo } from '../providers/types';

export default function Slideshow() {
    const { id } = useParams();
    const data = useData();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch photos
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const records = await data.listApprovedPhotos(id!);
                setPhotos(records);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        let unsubscribe: () => void;

        if (id) {
            fetchPhotos();

            // Subscribe to realtime updates
            unsubscribe = data.subscribeToPhotos((e) => {
                if (e.record.event === id && e.record.status === 'approved') {
                    if (e.action === 'create') {
                        setPhotos((prev) => [e.record, ...prev]);
                    } else if (e.action === 'delete') {
                        setPhotos((prev) => prev.filter((p) => p.id !== e.record.id));
                    }
                }
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [id, data]);

    // Cycle photos
    useEffect(() => {
        if (photos.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, [photos]);

    if (loading) return <Center h="100vh"><Loader size="xl" /></Center>;
    if (photos.length === 0) return <Center h="100vh"><Title c="dimmed">No photos yet...</Title></Center>;

    const currentPhoto = photos[currentIndex];

    return (
        <Center h="100vh" bg="black">
            <Image
                src={data.getPhotoUrl(currentPhoto)}
                h="100%"
                w="auto"
                fit="contain"
                alt="Slideshow"
            />
        </Center>
    );
}
