import { TextInput, Select, NumberInput, Checkbox, Button, Group, Title, Box, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useData } from '../providers/DataProvider';

export default function EventsNew() {
    const navigate = useNavigate();
    const data = useData();
    const form = useForm({
        initialValues: {
            name: '',
            code: '',
            visibility: 'public',
            join_mode: 'open',
            approval_required: false,
            allow_anonymous_uploads: true,
            storage_limit_mb: 1000,
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
            code: (value) => (value.length < 3 ? 'Code must be at least 3 characters' : null),
        },
    });

    const handleSubmit = async (values: any) => {
        try {
            // Force code to uppercase
            const finalValues = { ...values, code: values.code.toUpperCase() };
            const record = await data.createEvent(finalValues);
            notifications.show({
                title: 'Success',
                message: 'Event created successfully',
                color: 'green',
            });
            navigate(`/events/${record.id}`);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: 'Failed to create event',
                color: 'red',
            });
        }
    };

    return (
        <Container size="sm">
            <Title order={2} mb="lg">Create New Event</Title>
            <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="Event Name"
                    placeholder="My Wedding"
                    required
                    mb="md"
                    {...form.getInputProps('name')}
                />

                <TextInput
                    label="Join Code"
                    placeholder="WEDDING2024"
                    description="Unique code for guests to join"
                    required
                    mb="md"
                    {...form.getInputProps('code')}
                />

                <Group grow mb="md">
                    <Select
                        label="Visibility"
                        data={['public', 'unlisted', 'private']}
                        {...form.getInputProps('visibility')}
                    />
                    <Select
                        label="Join Mode"
                        data={['open', 'pin', 'invite_only']}
                        {...form.getInputProps('join_mode')}
                    />
                </Group>

                <NumberInput
                    label="Storage Limit (MB)"
                    min={100}
                    mb="md"
                    {...form.getInputProps('storage_limit_mb')}
                />

                <Checkbox
                    label="Require Approval for Photos"
                    mb="sm"
                    {...form.getInputProps('approval_required', { type: 'checkbox' })}
                />

                <Checkbox
                    label="Allow Anonymous Uploads"
                    mb="xl"
                    {...form.getInputProps('allow_anonymous_uploads', { type: 'checkbox' })}
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={() => navigate('/events')}>Cancel</Button>
                    <Button type="submit">Create Event</Button>
                </Group>
            </Box>
        </Container>
    );
}
