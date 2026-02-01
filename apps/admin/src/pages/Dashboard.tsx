import { useEffect, useState } from 'react';
import { Title, SimpleGrid, Card, Text, Group, ThemeIcon, Loader, Center } from '@mantine/core';
import { IconPhoto, IconUsers, IconCalendarEvent, IconAlertCircle } from '@tabler/icons-react';
import { useData } from '../providers/DataProvider';
import type { DashboardStats } from '../providers/types';
import { notifications } from '@mantine/notifications';

export default function Dashboard() {
    const data = useData();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await data.getStats();
                setStats(result);
            } catch (error) {
                console.error(error);
                notifications.show({ title: 'Error', message: 'Failed to load dashboard stats', color: 'red' });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [data]);

    if (loading) return <Center h={200}><Loader /></Center>;
    if (!stats) return <Text>No data available</Text>;

    const statCards = [
        { label: 'Total Events', value: stats.totalEvents, icon: IconCalendarEvent, color: 'blue' },
        { label: 'Total Photos', value: stats.totalPhotos, icon: IconPhoto, color: 'green' },
        { label: 'Total Users', value: stats.totalUsers, icon: IconUsers, color: 'cyan' },
        { label: 'Pending Approvals', value: stats.pendingPhotos, icon: IconAlertCircle, color: 'orange' },
    ];

    return (
        <div>
            <Title order={2} mb="lg">Dashboard</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                {statCards.map((stat) => (
                    <Card key={stat.label} shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                    {stat.label}
                                </Text>
                                <Text fw={700} size="xl">
                                    {stat.value}
                                </Text>
                            </div>
                            <ThemeIcon
                                color={stat.color}
                                variant="light"
                                size={38}
                                radius="md"
                            >
                                <stat.icon size="1.5rem" stroke={1.5} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                ))}
            </SimpleGrid>
        </div>
    );
}
