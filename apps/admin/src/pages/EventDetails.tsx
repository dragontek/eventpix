import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Title, Text, Button, Group, Loader, Center } from '@mantine/core';
import { IconPhoto, IconSettings, IconUsers, IconArrowLeft } from '@tabler/icons-react';
import { useData } from '../providers/DataProvider';
import type { Event } from '../providers/types';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const data = useData();
    const [event, setEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const record = await data.getEvent(id!);
                setEvent(record);
            } catch (error) {
                console.error(error);
                navigate('/events');
            }
        };
        if (id) fetchEvent();
    }, [id, navigate, data]);

    if (!event) return <Center h={200}><Loader /></Center>;

    return (
        <>
            <Button variant="subtle" leftSection={<IconArrowLeft size="1rem" />} onClick={() => navigate('/events')} mb="md">
                Back to Events
            </Button>

            <Group justify="space-between" mb="lg">
                <Title order={2}>{event.name}</Title>
                <Text c="dimmed">{event.code}</Text>
            </Group>

            <Tabs defaultValue="photos">
                <Tabs.List>
                    <Tabs.Tab value="photos" leftSection={<IconPhoto size="0.8rem" />}>Photos</Tabs.Tab>
                    <Tabs.Tab value="moderation" leftSection={<IconUsers size="0.8rem" />}>Moderation</Tabs.Tab>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size="0.8rem" />}>Settings</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="photos" pt="xs">
                    <Text my="md">Photo Gallery Management (Coming Soon)</Text>
                </Tabs.Panel>

                <Tabs.Panel value="moderation" pt="xs">
                    <Text my="md">Moderation Queue (Coming Soon)</Text>
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xs">
                    <Text my="md">Event Settings Form (Coming Soon)</Text>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
