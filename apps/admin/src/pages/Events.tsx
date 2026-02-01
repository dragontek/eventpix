import { useEffect, useState } from 'react';
import { Table, Title, Button, Group, Badge, ActionIcon, Loader, Center, Tooltip } from '@mantine/core';
import { IconEye, IconTrash, IconPlus } from '@tabler/icons-react';
import { useData } from '../providers/DataProvider';
import type { Event } from '../providers/types';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function Events() {
    const data = useData();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const records = await data.listEvents();
            setEvents(records);
        } catch (error: any) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: error.originalError?.message || error.message || 'Failed to fetch events',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [data]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await data.deleteEvent(id);
            notifications.show({ title: 'Success', message: 'Event deleted', color: 'green' });
            fetchEvents();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete event', color: 'red' });
        }
    };



    const rows = events.map((event) => (
        <Table.Tr key={event.id}>
            <Table.Td>{event.name}</Table.Td>
            <Table.Td>{event.code}</Table.Td>
            <Table.Td>
                <Tooltip label={
                    event.visibility === 'public' ? 'Visible via search & landing page' :
                        event.visibility === 'unlisted' ? 'Accessible only via direct link' :
                            'Hidden from all lists'
                }>
                    <Badge
                        color={
                            event.visibility === 'public' ? 'green' :
                                event.visibility === 'unlisted' ? 'gray' : 'blue'
                        }
                        style={{ cursor: 'help' }}
                    >
                        {event.visibility}
                    </Badge>
                </Tooltip>
            </Table.Td>
            <Table.Td>{event.photoCount || 0}</Table.Td>
            <Table.Td>
                <Tooltip label={
                    event.join_mode === 'open' ? 'Anyone can enter' :
                        event.join_mode === 'pin' ? 'Requires PIN code' :
                            'Restricted to invited emails'
                }>
                    <Badge variant="outline" color="gray" style={{ cursor: 'help' }}>
                        {event.join_mode?.replace('_', ' ')}
                    </Badge>
                </Tooltip>
            </Table.Td>
            <Table.Td>{new Date(event.created).toLocaleDateString()}</Table.Td>
            <Table.Td>
                <Group gap={5}>
                    <ActionIcon variant="light" color="blue" onClick={() => navigate(`/events/${event.id}`)}>
                        <IconEye size="1rem" />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(event.id)}>
                        <IconTrash size="1rem" />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    if (loading) return <Center h={200}><Loader /></Center>;

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Events</Title>
                <Button leftSection={<IconPlus size="1rem" />} onClick={() => navigate('/events/new')}>Create Event</Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Visibility</Table.Th>
                        <Table.Th>Photos</Table.Th>
                        <Table.Th>Join Mode</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </>
    );
}
