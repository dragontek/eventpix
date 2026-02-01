import { useEffect, useState } from 'react';
import { Title, SimpleGrid, Card, Image, Group, Button, Text, Badge, Loader, Center } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useData } from '../providers/DataProvider';
import type { Photo } from '../providers/types';
import { notifications } from '@mantine/notifications';

export default function ModerationQueue() {
    const data = useData();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingPhotos = async () => {
        try {
            const records = await data.listPendingPhotos();
            setPhotos(records);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to fetch pending photos', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPhotos();
    }, [data]);

    const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await data.updatePhotoStatus(id, status);
            notifications.show({
                title: 'Success',
                message: `Photo ${status}`,
                color: status === 'approved' ? 'green' : 'red'
            });
            // Remove from list
            setPhotos((current) => current.filter((p) => p.id !== id));
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
        }
    };

    if (loading) return <Center h={200}><Loader /></Center>;

    return (
        <>
            <Title order={2} mb="lg">Moderation Queue</Title>

            {photos.length === 0 ? (
                <Text c="dimmed">No photos pending moderation.</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                    {photos.map((photo) => (
                        <Card key={photo.id} shadow="sm" padding="sm" radius="md" withBorder>
                            <Card.Section>
                                <Image
                                    src={data.getPhotoUrl(photo)}
                                    height={200}
                                    alt={photo.caption || 'Event photo'}
                                />
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={500} truncate>{photo.expand?.event?.name || 'Unknown Event'}</Text>
                                <Badge color="yellow">Pending</Badge>
                            </Group>

                            <Text size="sm" c="dimmed" mb="md">
                                Uploaded by: {photo.expand?.owner?.email || 'Anonymous'}
                                <br />
                                {new Date(photo.created).toLocaleString()}
                            </Text>

                            <Group grow>
                                <Button
                                    leftSection={<IconCheck size="1rem" />}
                                    color="green"
                                    variant="light"
                                    onClick={() => handleModeration(photo.id, 'approved')}
                                >
                                    Approve
                                </Button>
                                <Button
                                    leftSection={<IconX size="1rem" />}
                                    color="red"
                                    variant="light"
                                    onClick={() => handleModeration(photo.id, 'rejected')}
                                >
                                    Reject
                                </Button>
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </>
    );
}
