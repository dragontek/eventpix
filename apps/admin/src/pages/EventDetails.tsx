import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Title, Text, Button, Group, Loader, Center, SimpleGrid, Card, Image, AspectRatio, ActionIcon, TextInput, Select, NumberInput, Checkbox, Box, Badge, Alert } from '@mantine/core';
import { IconPhoto, IconSettings, IconUsers, IconArrowLeft, IconTrash, IconHeart, IconDownload, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useData } from '../providers/DataProvider';
import type { Event, Photo } from '../providers/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

dayjs.extend(relativeTime);

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const data = useData();
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);

    // Form setup
    const form = useForm({
        initialValues: {
            name: '',
            code: '',
            visibility: 'public',
            join_mode: 'open',
            approval_required: false,
            allow_anonymous_uploads: true,
            storage_limit_mb: 1000,
            pin: '',
        },
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const record = await data.getEvent(id!);
                setEvent(record);
                form.setValues({
                    name: record.name,
                    code: record.code,
                    visibility: record.visibility,
                    join_mode: record.join_mode,
                    approval_required: record.approval_required,
                    allow_anonymous_uploads: record.allow_anonymous_uploads,
                    storage_limit_mb: record.storage_limit_mb,
                    pin: (record as any).pin || '',
                });

                // Fetch photos too
                const photoRecords = await data.listEventPhotos(id!);
                setPhotos(photoRecords);

            } catch (error) {
                console.error(error);
                navigate('/events');
            }
        };
        if (id) {
            fetchEvent();

            // Realtime subscription
            const unsubscribe = data.subscribeToPhotos((e) => {
                if (e.record.event !== id) return; // Ignore other events

                if (e.action === 'create') {
                    // New photo uploaded
                    // Ideally we'd expand it, but for now push what we have or fetch it
                    // Let's fetch it to be safe and get expands (owner)
                    data.getEvent(id!).then(() => {
                        // actually just fetch all again or fetch one? 
                        // Fetching one is cleaner but `getPhoto` isn't in interface/provider specifically for one expanded
                        // Let's just re-fetch list for simplicity or append if we can. 
                        // Re-fetching list ensures sort order and data consistency for now.
                        data.listEventPhotos(id!).then(setPhotos);
                    });
                } else if (e.action === 'delete') {
                    setPhotos(prev => prev.filter(p => p.id !== e.record.id));
                } else if (e.action === 'update') {
                    setPhotos(prev => prev.map(p => p.id === e.record.id ? { ...p, ...e.record } : p));
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, [id, data]); // removed navigate from deps to avoid loop if it changes

    const handleUpdate = async (values: any) => {
        try {
            await data.updateEvent(id!, values);
            notifications.show({ title: 'Success', message: 'Event updated', color: 'green' });
            // Refresh local state?
            setEvent({ ...event!, ...values });
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to update event', color: 'red' });
        }
    };

    const handleDeleteEvent = async () => {
        if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
        try {
            await data.deleteEvent(id!);
            notifications.show({ title: 'Success', message: 'Event deleted', color: 'green' });
            navigate('/events');
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete event', color: 'red' });
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm('Permanently delete this photo?')) return;
        try {
            await data.deletePhoto(photoId);

            // Refresh photos
            // Optimistic update
            setPhotos(prev => prev.filter(p => p.id !== photoId));

            notifications.show({ title: 'Success', message: 'Photo deleted', color: 'blue' });
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete photo', color: 'red' });
        }
    };

    const handleDownloadPhoto = async (photo: Photo) => {
        const url = data.getPhotoUrl(photo);
        saveAs(url, `photo-${photo.id}.jpg`);
    };

    const [invitations, setInvitations] = useState<any[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    // Fetch invitations if mode is invite_only
    useEffect(() => {
        if (event && event.join_mode === 'invite_only') {
            data.listInvitations(id!).then(setInvitations).catch(console.error);
        }
    }, [event, id, data]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            const newInvite = await data.createInvitation(id!, inviteEmail);
            setInvitations(prev => [newInvite, ...prev]);
            setInviteEmail('');
            notifications.show({ title: 'Success', message: 'Invitation added', color: 'green' });
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to add invitation', color: 'red' });
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteInvitation = async (inviteId: string) => {
        try {
            await data.deleteInvitation(inviteId);
            setInvitations(prev => prev.filter(i => i.id !== inviteId));
            notifications.show({ title: 'Success', message: 'Invitation removed', color: 'blue' });
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to remove invitation', color: 'red' });
        }
    };

    const copyInviteLink = () => {
        // Construct link (assuming web app is on same domain or known relationship)
        // Admin usually on different port than web.
        // Let's assume standard local dev ports for now: admin 5173, web 3000? 
        // Or if production, use relative. 
        // Best guess: user wants the EVENT URL.
        const origin = window.location.origin.replace('5173', '3000'); // hacky dev assumption or use config
        const link = `${origin}/event/${id}`;
        navigator.clipboard.writeText(link);
        notifications.show({ title: 'Copied', message: 'Link copied to clipboard', color: 'blue' });
    };

    const handleDownloadAll = async () => {
        if (photos.length === 0) return;

        const zip = new JSZip();
        let count = 0;
        const total = photos.length;
        const notificationId = notifications.show({ // renamed from id to avoid conflict
            title: 'Downloading...',
            message: `Preparing 0/${total} photos`,
            loading: true,
            autoClose: false
        });

        try {
            await Promise.all(photos.map(async (photo) => {
                const url = data.getPhotoUrl(photo);
                const response = await fetch(url);
                const blob = await response.blob();
                zip.file(`photo-${photo.id}.jpg`, blob);
                count++;
                notifications.update({ id: notificationId, title: 'Downloading...', message: `Prepared ${count}/${total} photos`, loading: true, autoClose: false });
            }));

            notifications.update({ id: notificationId, title: 'Zipping...', message: 'Compressing files...', loading: true, autoClose: false });
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `event-${event?.code || 'photos'}.zip`);

            notifications.update({ id: notificationId, title: 'Success', message: 'Download started', color: 'green', loading: false, autoClose: 2000 });
        } catch (error) {
            console.error(error);
            notifications.update({ id: notificationId, title: 'Error', message: 'Failed to download photos', color: 'red', loading: false, autoClose: 4000 });
        }
    };


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
                <Group justify="space-between" align="center" mb="md">
                    <Tabs.List>
                        <Tabs.Tab value="photos" leftSection={<IconPhoto size="0.8rem" />}>Photos ({photos.length})</Tabs.Tab>
                        <Tabs.Tab value="moderation" leftSection={<IconUsers size="0.8rem" />}>Moderation</Tabs.Tab>
                        <Tabs.Tab value="settings" leftSection={<IconSettings size="0.8rem" />}>Settings</Tabs.Tab>
                    </Tabs.List>
                    <Button
                        leftSection={<IconDownload size="0.9rem" />}
                        variant="light"
                        size="xs"
                        onClick={handleDownloadAll}
                        disabled={photos.length === 0}
                    >
                        Download All
                    </Button>
                </Group>

                <Tabs.Panel value="photos" pt="lg">
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
                        {photos.map(photo => (
                            <Card key={photo.id} padding="sm" radius="md" withBorder>
                                <Card.Section>
                                    <AspectRatio ratio={1} style={{ position: 'relative' }}>
                                        <Image
                                            src={data.getPhotoUrl(photo)}
                                            alt={photo.caption}
                                        />
                                        {photo.caption && (
                                            <Box
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                    padding: '8px 8px 4px', // Extra bottom padding if needed, but text is usually fine
                                                    color: 'white',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                                    zIndex: 1
                                                }}
                                            >
                                                <Text size="xs" lineClamp={2} fw={500} c="white">
                                                    {photo.caption}
                                                </Text>
                                            </Box>
                                        )}
                                    </AspectRatio>
                                </Card.Section>
                                {/* Removed separate caption block */}
                                <Group justify="space-between" mt="xs">
                                    <Text size="xs" c="dimmed">
                                        by {photo.expand?.owner?.name || photo.expand?.owner?.email || 'Guest'}
                                        <br />
                                        {dayjs(photo.created).fromNow()}
                                    </Text>
                                    <Group gap={4}>
                                        <IconHeart size="0.8rem" color="red" />
                                        <Text size="xs">{photo.likes?.length || 0}</Text>
                                    </Group>
                                </Group>
                                <Group mt="xs" justify="space-between">
                                    <Badge
                                        color={photo.status === 'approved' ? 'green' : photo.status === 'pending' ? 'yellow' : 'red'}
                                        variant="light"
                                        size="sm"
                                    >
                                        {photo.status}
                                    </Badge>
                                    <Group gap={0}>
                                        <ActionIcon color="blue" variant="subtle" onClick={() => handleDownloadPhoto(photo)}>
                                            <IconDownload size="0.8rem" />
                                        </ActionIcon>
                                        <ActionIcon color="red" variant="subtle" onClick={() => handleDeletePhoto(photo.id)}>
                                            <IconTrash size="0.8rem" />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Tabs.Panel>

                <Tabs.Panel value="moderation" pt="lg">
                    {photos.filter(p => p.status === 'pending').length === 0 ? (
                        <Text c="dimmed">No pending photos.</Text>
                    ) : (
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
                            {photos.filter(p => p.status === 'pending').map(photo => (
                                <Card key={photo.id} padding="sm" radius="md" withBorder>
                                    <Card.Section>
                                        <AspectRatio ratio={1}>
                                            <Image
                                                src={data.getPhotoUrl(photo)}
                                                alt={photo.caption}
                                            />
                                        </AspectRatio>
                                    </Card.Section>
                                    <Text size="sm" mt="xs" lineClamp={1}>{photo.caption || 'No caption'}</Text>
                                    <Text size="xs" c="dimmed" mb="xs">
                                        by {photo.expand?.owner?.name || photo.expand?.owner?.email || 'Anonymous'}
                                    </Text>
                                    <Group grow>
                                        <Button
                                            size="xs"
                                            color="green"
                                            variant="light"
                                            onClick={() => {
                                                data.updatePhotoStatus(photo.id, 'approved');
                                                setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'approved' } : p));
                                                notifications.show({ title: 'Approved', message: 'Photo approved', color: 'green' });
                                            }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="xs"
                                            color="red"
                                            variant="light"
                                            onClick={() => {
                                                data.updatePhotoStatus(photo.id, 'rejected');
                                                setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'rejected' } : p));
                                                notifications.show({ title: 'Rejected', message: 'Photo rejected', color: 'red' });
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="lg">
                    <Box component="form" onSubmit={form.onSubmit(handleUpdate)} maw={500}>
                        <TextInput
                            label="Event Name"
                            required
                            mb="md"
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label="Event Code"
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

                        {form.values.visibility === 'public' && (
                            <Alert icon={<IconAlertCircle size="1rem" />} color="orange" mb="md" p="xs">
                                Warning: This event will be visible to anyone visiting the site.
                            </Alert>
                        )}

                        {form.values.visibility === 'private' && (
                            <Alert icon={<IconInfoCircle size="1rem" />} color="blue" mb="md" p="xs">
                                Guests will need the Event Code above.
                            </Alert>
                        )}

                        {form.values.visibility === 'unlisted' && (
                            <Button variant="light" size="xs" fullWidth mb="md" onClick={copyInviteLink}>
                                Copy Event Link
                            </Button>
                        )}

                        {form.values.join_mode === 'pin' && (
                            <TextInput
                                label="PIN Code"
                                description="Required for guests to join"
                                mb="md"
                                required
                                {...form.getInputProps('pin')}
                            />
                        )}

                        {/* Invite Only Settings */}
                        {form.values.join_mode === 'invite_only' && (
                            <Card withBorder mb="lg" radius="md">
                                <Title order={5} mb="sm">Manage Invitations</Title>
                                <Group align="flex-end" mb="md">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        label="Invitee Email"
                                        placeholder="user@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                    />
                                    <Button onClick={handleInvite} loading={inviting}>Add</Button>
                                </Group>

                                <Box mah={200} style={{ overflowY: 'auto' }}>
                                    {invitations.length === 0 ? (
                                        <Text c="dimmed" size="sm">No pending invitations.</Text>
                                    ) : (
                                        invitations.map(invite => (
                                            <Group key={invite.id} justify="space-between" mb="xs" p="xs" bg="gray.9" style={{ borderRadius: 4 }}>
                                                <Text size="sm">{invite.email}</Text>
                                                <ActionIcon color="red" size="sm" variant="subtle" onClick={() => handleDeleteInvitation(invite.id)}>
                                                    <IconTrash size="0.8rem" />
                                                </ActionIcon>
                                            </Group>
                                        ))
                                    )}
                                </Box>
                            </Card>
                        )}


                        <NumberInput
                            label="Storage Limit (MB)"
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
                        <Group justify="space-between">
                            <Button color="red" variant="outline" onClick={handleDeleteEvent}>Delete Event</Button>
                            <Button type="submit">Save Changes</Button>
                        </Group>
                    </Box>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
